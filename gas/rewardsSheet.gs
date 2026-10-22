// ─── syncRewards_ (PRIVATE) ─────────────────────────────────────────────────────────────
/**
 * Evaluates prizes and bonuses for a given year/month, persists results to the
 * 'rewards' sheet (one row per user per fiscal year, prizes/bonuses as JSON
 * strings), and returns the payslip-ready slice for the requested month.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} gs
 * @param {number|string} year
 * @param {number|string} month  - The payslip month (client pays previous month's salary)
 * @returns {Object} { [userId]: { month, prizes, bonuses } }
 */
function syncRewards_(gs, year, month) {
  // NOTE that this function is only called by `processMultiplePayslips`.
  // So, `LockService.getScriptLock();` is not set here, as well as `try and catch`

  // ── 1. Batch reads ──────────────────────────────────────────────────────
  const ws = gs.getSheetById(SHEET_IDS.REWARDS);
  const rewardsData = ws.getDataRange().getValues();
  const [headers, ...rows] = rewardsData;

  // syncMonthlyAttendance writes to its own sheet and returns:
  // { [userId]: [attendanceSummary, ...] }  (all months in the fiscal year)
  const attendanceSummaries = syncMonthlyAttendance_(gs, year, month);

  // ── 2. Evaluate prizes + bonuses ────────────────────────────────────────
  const userPrizes = evaluatePrize_(attendanceSummaries, year, month);
  const userBonuses = evaluateBonus_(attendanceSummaries, year, month);

  // Index by userId for O(1) lookups
  /** @type {Map<string, Object>} */
  const prizesMap = new Map(userPrizes.map((u) => [u.userId, u]));
  /** @type {Map<string, Object>} */
  const bonusesMap = new Map(userBonuses.map((u) => [u.userId, u]));

  // ── 3. Separate existing rows ───────────────────────────────────────────
  const fiscalYear = getFiscalYear_(year, month);
  const today = new Date().toISOString();

  const otherRows = [];
  /** @type {Map<string, Array>} */
  const existingFyMap = new Map();

  rows.forEach((row) => {
    if (Number(row[2]) === fiscalYear) {
      existingFyMap.set(row[1], row); // key = userId
    } else {
      otherRows.push(row);
    }
  });

  // ── 4. Build updated/inserted rows ─────────────────────────────────────
  const updatedRows = Object.keys(attendanceSummaries).map((userId) => {
    const prizeData = prizesMap.get(userId) ?? { prizes: [] };
    const bonusData = bonusesMap.get(userId) ?? { bonuses: [] };

    const existing = existingFyMap.get(userId);

    if (existing) {
      // Merge new month's data into the existing fiscal-year arrays.
      // Stored as JSON strings because Sheets cannot hold native arrays.
      const storedPrizes = JSON.parse(existing[3] || "[]");
      const storedBonuses = JSON.parse(existing[4] || "[]");

      const mergedPrizes = mergePrizesByMonth_(storedPrizes, prizeData.prizes);
      const mergedBonuses = mergeBonusesByMonth_(
        storedBonuses,
        bonusData.bonuses,
      );

      existing[3] = JSON.stringify(mergedPrizes);
      existing[4] = JSON.stringify(mergedBonuses);
      existing[6] = today; // updated_at
      return existing;
    }

    // New fiscal-year row
    return [
      Utilities.getUuid(), // rewardId
      userId, // userId
      fiscalYear, // fiscalYear
      JSON.stringify(prizeData.prizes ?? []), // prizes  (JSON)
      JSON.stringify(bonusData.bonuses ?? []), // bonuses (JSON)
      today, // created_at
      today, // updated_at
    ];
  });

  // ── 5. Atomic write-back ────────────────────────────────────────────────
  const finalOutput = [...otherRows, ...updatedRows]; // .setValues() takes 2D arr only.

  ws.clearContents();
  ws.getRange(1, 1, 1, headers.length).setValues([headers]);
  ws.getRange(2, 1, finalOutput.length, headers.length).setValues(finalOutput);
  SpreadsheetApp.flush();

  // ── 6. Build return value for processMultiplePayslips ──────────────────
  // Returns only the matching month's prize + bonus data, keyed by userId.
  return buildPayslipRewardsSlice_(updatedRows, headers, Number(month));
}

// ─── Return-value builder (ALL PRIVATE) ─────────────────────────────────────────────────────
/**
 * Extracts only the target month's prize/bonus entries from the written rows.
 *
 * NO SHEET CALLS
 *
 * @param {Array<Array>} rows    - Final written rows (arrays, not objects)
 * @param {Array<string>} headers
 * @param {number} month
 * @returns {{ [userId]: { month: number, prizes: Object|null, bonuses: Object } }}
 */
function buildPayslipRewardsSlice_(rows, headers, month) {
  return rows.reduce((acc, row) => {
    const obj = Object.fromEntries(
      headers.map((header, i) => [header, row[i]]),
    );
    const userId = obj.userId;

    const allPrizes = JSON.parse(obj.prizes || "[]");
    const allBonuses = JSON.parse(obj.bonuses || "[]");

    // A prize entry exists only when a milestone was actually reached that month.
    const monthPrize = allPrizes.find((prize) => prize.month === month) ?? null;
    // A bonus entry always exists for each worked month.
    const monthBonus =
      allBonuses.find((bonus) => bonus.month === month) ?? null;

    acc[userId] = {
      month,
      prizes: monthPrize, // null when no milestone reached
      bonuses: monthBonus, // null when user has no attendance record
    };

    return acc;
  }, {});
}

// ─── Merge helpers (ALL PRIVATE) ────────────────────────────────────────────────────────────
/**
 * Upserts a month's prize entry into the stored prizes array.
 * Keeps entries with no prizes (empty details) to preserve audit history.
 *
 * NO SHEET CALLS
 */
function mergePrizesByMonth_(stored, incoming) {
  if (!incoming || incoming.length === 0) return stored;
  const map = new Map(stored.map((p) => [p.month, p]));
  incoming.forEach((p) => map.set(p.month, p));
  return Array.from(map.values()).sort(
    (a, b) => toFiscalIndex_(a.month) - toFiscalIndex_(b.month),
  );
}

/**
 * Upserts a month's bonus entry into the stored bonuses array.
 *
 * NO SHEET CALLS
 */
function mergeBonusesByMonth_(stored, incoming) {
  if (!incoming || incoming.length === 0) return stored;
  const map = new Map(stored.map((b) => [b.month, b]));
  incoming.forEach((b) => map.set(b.month, b));
  return Array.from(map.values()).sort(
    (a, b) => toFiscalIndex_(a.month) - toFiscalIndex_(b.month),
  );
}

/** April(4) → 0 … March(3) → 11 */
function toFiscalIndex_(m) {
  return m >= 4 ? m - 4 : m + 8;
}

// ─── evaluatePrize (PRIVATE) ────────────────────────────────────────────────
/**
 * Independently evaluates TYPE1, TYPE2, and TYPE3 prize eligibility.
 *
 * TYPE1: fires when totalCount % 3 === 0 (every 3 occurrences, non-continuous)
 * TYPE2: fires when trailing streak === 6
 * TYPE3: fires when trailing streak === 12
 * All three are independent — any combination can apply in a single month.
 *
 * NO SHEET CALLS
 *
 * @param {Object} attendanceSummaries  { [userId]: [attendanceSummary, ...] }
 * @param {number|string} year
 * @param {number|string} month
 * @returns {Array<{ userId, fiscalYear, prizes: Array }>}
 */
function evaluatePrize_(attendanceSummaries, year, month) {
  const targetMonth = Number(month);
  const eligibleMonths = countPrizedMonth_(attendanceSummaries, year, month);

  return eligibleMonths.map(({ userId, fiscalYear, months }) => {
    const result = { userId, fiscalYear, prizes: [] };

    // Early exit: user didn't qualify in the target month at all
    if (months[months.length - 1] !== targetMonth) return result;

    const totalCount = months.length;

    // Compute trailing consecutive streak (working backwards, fiscal-aware)
    let streak = 1;
    for (let i = months.length - 1; i > 0; i--) {
      const currIndex = toFiscalIndex_(months[i]);
      const prevIndex = toFiscalIndex_(months[i - 1]);
      if (currIndex === prevIndex + 1) {
        streak++;
      } else {
        break;
      }
    }

    // ── Independent prize evaluation ──────────────────────────────────────
    const details = [];
    let totalForMonths = 0;

    // TYPE3: full fiscal year (12 continuous)
    if (streak === 12) {
      details.push({
        type: "TYPE3",
        label: "12-Mo Prize",
        amount: TWELVE_MONTHS_PRIZE,
      });
      totalForMonths += TWELVE_MONTHS_PRIZE;
    }

    // TYPE2: 6 continuous months
    if (streak === 6 || streak === 12) {
      details.push({
        type: "TYPE2",
        label: "6-Mo Prize",
        amount: SIX_MONTHS_PRIZE,
      });
      totalForMonths += SIX_MONTHS_PRIZE;
    }

    // TYPE1: every 3rd occurrence (non-continuous), independent of streak
    if (totalCount % 3 === 0) {
      details.push({
        type: "TYPE1",
        label: "3x Prize",
        amount: THREE_TIMES_PRIZE,
      });
      totalForMonths += THREE_TIMES_PRIZE;
    }

    // Only push an entry when at least one prize was earned
    if (details.length > 0) {
      result.prizes.push({ month: targetMonth, totalForMonths, details });
    }

    return result;
  });
}

// ─── evaluateBonus (PRIVATE) ────────────────────────────────────────────────
/**
 * Calculates "tiered" bonuses for each user for every month in the fiscal year.
 *
 * NO SHEET CALLS
 *
 * @param {Object} attendanceSummaries
 * @param {number|string} year
 * @param {number|string} month
 * @returns {Array<{ userId, fiscalYear, bonuses: Array }>}
 */
function evaluateBonus_(attendanceSummaries, year, month) {
  const fiscalYear = getFiscalYear_(year, month);

  return Object.entries(attendanceSummaries).map(([userId, summaries]) => {
    const fySummaries = summaries.filter(
      (s) => Number(s.fiscalYear) === fiscalYear,
    );

    const bonuses = fySummaries.map((summary) => {
      const {
        halfDayCounts,
        fullDayCounts,
        totalDays,
        isBonusAwarded,
        month: summaryMonth,
      } = summary;

      const isFullDayDominant = fullDayCounts > halfDayCounts;

      const details = [];

      // Tier 1 — 15+ days
      const amountA =
        totalDays >= BONUS_CONSTANTS.bonusA.days
          ? isFullDayDominant
            ? BONUS_CONSTANTS.bonusA.maxAmount
            : BONUS_CONSTANTS.bonusA.minAmount
          : 0;
      details.push({
        type: BONUS_CONSTANTS.bonusA.type,
        label: BONUS_CONSTANTS.bonusA.label,
        amount: amountA,
      });

      // Tier 2 — 20+ days
      const amountB =
        totalDays >= BONUS_CONSTANTS.bonusB.days
          ? isFullDayDominant
            ? BONUS_CONSTANTS.bonusB.maxAmount
            : BONUS_CONSTANTS.bonusB.minAmount
          : 0;
      details.push({
        type: BONUS_CONSTANTS.bonusB.type,
        label: BONUS_CONSTANTS.bonusB.label,
        amount: amountB,
      });

      // Tier 3 — perfect attendance
      const amountC = isBonusAwarded
        ? isFullDayDominant
          ? BONUS_CONSTANTS.bonusC.maxAmount
          : BONUS_CONSTANTS.bonusC.minAmount
        : 0;
      details.push({
        type: BONUS_CONSTANTS.bonusC.type,
        label: BONUS_CONSTANTS.bonusC.label,
        amount: amountC,
      });

      return {
        month: summaryMonth,
        totalForMonth: amountA + amountB + amountC,
        details,
      };
    });

    return { userId, fiscalYear, bonuses };
  });
}

// ─── countPrizedMonth (PRIVATE) ─────────────────────────────────────────────────
/**
 * Returns, for each user, the sorted list of months within the fiscal year
 * where isPrizeAwarded === true, up to and including the target month.
 *
 * NO SHEET CALLS
 *
 * @param {Object} attendanceSummaries
 * @param {number|string} year
 * @param {number|string} month
 * @returns {Array<{ userId, fiscalYear, months: number[] }>}
 */
function countPrizedMonth_(attendanceSummaries, year, month) {
  const fiscalYear = getFiscalYear_(year, month);
  const targetIndex = toFiscalIndex_(Number(month));

  return Object.entries(attendanceSummaries).map(([userId, summaries]) => {
    const awardedMonths = summaries
      .filter(
        (s) =>
          s.isPrizeAwarded &&
          Number(s.fiscalYear) === fiscalYear &&
          toFiscalIndex_(s.month) <= targetIndex,
      )
      .map((s) => s.month)
      .sort((a, b) => toFiscalIndex_(a) - toFiscalIndex_(b));

    return { userId, fiscalYear, months: awardedMonths };
  });
}

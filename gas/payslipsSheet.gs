// IMPORTANT: The heaviest, the most expensive and vital functions here.
// Make sure to read the comment before touching the code.

// ─── ENTRY POINT: processMultiplePayslips  (PUBLIC) ──────────────────────────────────────────────────
/**
 * Entry point. Processes payslips for selected users for a given month,
 * persists results to the 'payslips' sheet, and returns ready-to-render
 * payslip data to the frontend.
 *
 * @param {string[]} userIds - Selected user UUIDs from the frontend
 * @param {number|string} year
 * @param {number|string} month - Always the previous month
 * @returns {{ succeeded: Object[], failed: { userId: string, error: string }[] }}
 */
function processMultiplePayslips(userIds, year, month) {
  return withScriptLock_(
    "processMultiplePayslips",
    (gs) => {
      const ws = gs.getSheetById(SHEET_IDS.PAYSLIPS);
      const fullData = ws.getDataRange().getValues();
      const [headers, ...rows] = fullData;

      // ── 1. Batch reads ────────────────────────────────────────────────────
      const allUsers = getUsers_(gs);
      const userLogsMap = getWorkLogsForMonth_(gs, year, month); // { [userId]: [log, ...] }
      const hourlyWages = getHourlyWageSettings_(gs); // [{ workType, hourlyWage }, ...]
      const allRewards = syncRewards_(gs, year, month); // { [userId]: { month, prizes, bonuses } }

      // ── 2. Index lookups ──────────────────────────────────────────────────
      // O(1) user lookup by userId
      const usersMap = new Map(allUsers.map((user) => [user.userId, user]));

      // O(1) hourly wage lookup by workType
      const wagesMap = new Map(
        hourlyWages.map((hw) => [hw.workType, Number(hw.hourlyWage)]),
      );

      // ── 3. Separate existing rows ─────────────────────────────────────────
      const targetYear = Number(year);
      const targetMonth = Number(month);

      // Rows for other months - never touched
      const otherMonthRows = [];

      // Rows matching this year + month but NOT in the selected userIds - preserved
      const otherUserRows = [];

      // Rows matching this year + month AND in the selected userIds - will be replaced
      /** @type {Map<string, Array>} key = userId */
      const existingSelectedMap = new Map();

      const selectedSet = new Set(userIds);

      rows.forEach((row) => {
        const rowUserId = row[2];
        const rowYear = Number(row[4]);
        const rowMonth = Number(row[5]);

        if (rowYear !== targetYear || rowMonth !== targetMonth) {
          otherMonthRows.push(row);
        } else if (!selectedSet.has(rowUserId)) {
          otherUserRows.push(row);
        } else {
          existingSelectedMap.set(rowUserId, row);
        }
      });

      // ── 4. Determine next reference number sequence ───────────────────────
      const allMonthRows = [...otherUserRows, ...existingSelectedMap.values()];

      const maxSeq = allMonthRows.reduce((max, row) => {
        const ref = row[1]; // referenceNumber column
        if (!ref || typeof ref !== "string") return max;
        const parts = ref.split("-");
        const seq = Number(parts[parts.length - 1]);
        return seq > max ? seq : max;
      }, 0);

      let nextSeq = maxSeq + 1;

      // ── 5. Process each selected user ─────────────────────────────────────
      const succeeded = [];
      const failed = [];

      const newSelectedRows = userIds
        .map((userId) => {
          try {
            const user = usersMap.get(userId);
            if (!user) throw new Error(`User not found: ${userId}`);

            const userLogs = userLogsMap[userId] ?? [];
            const rewards = allRewards[userId] ?? {
              month: targetMonth,
              prizes: null,
              bonuses: null,
            };

            const payslip = calculatePayslipData_({
              user,
              year: targetYear,
              month: targetMonth,
              workLogs: userLogs,
              wagesMap,
              rewards,
            });

            // Reuse existing payslipId and referenceNumber on update
            const existing = existingSelectedMap.get(userId);
            const payslipId = existing?.[0] ?? Utilities.getUuid();
            const referenceNumber =
              existing?.[1] ?? formatReferenceNumber_(year, month, nextSeq++);
            const issuedAt = new Date().toISOString();

            const row = buildPayslipRow_({
              payslipId,
              referenceNumber,
              issuedAt,
              payslip,
              year: targetYear,
              month: targetMonth,
            });

            // succeeded.push({ userId, referenceNumber, payslip }); // Modified as follows
            succeeded.push({
              userId,
              referenceNumber,
              payslip: {
                ...payslip,
                referenceNumber,
                year: targetYear,
                month: targetMonth,
                issuedAt,
              },
            });
            return row;
          } catch (err) {
            console.error(
              `processMultiplePayslips - failed for userId ${userId}: ${err}`,
            );
            failed.push({ userId, error: err.message });
            return null;
          }
        })
        .filter(Boolean); // remove nulls from failed users

      // ── 6. Atomic write-back ──────────────────────────────────────────────
      const finalRows = [
        ...otherMonthRows,
        ...otherUserRows,
        ...newSelectedRows,
      ];

      ws.clearContents();
      ws.getRange(1, 1, 1, headers.length).setValues([headers]);
      ws.getRange(2, 1, finalRows.length, headers.length).setValues(finalRows);
      SpreadsheetApp.flush();

      return { succeeded, failed };
    },
    18000,
  );
}

// ─── calculatePayslipData_ (PRIVATE) ─────────────────────────────────────────────────────
/**
 * Pure function. Derives all payslip figures from raw inputs.
 *
 * NO SHEET CALLS
 *
 * @param {{ user, year, month, workLogs, wagesMap, rewards }} params
 * @returns {Object} Structured payslip data ready for rendering and sheet storage
 */
function calculatePayslipData_({
  user,
  year,
  month,
  workLogs,
  wagesMap,
  rewards,
}) {
  // ── Work type breakdown ───────────────────────────────────────────────
  /** @type {Map<string, { hoursWorked: number, daysWorkedSet: Set<string> }>} */
  const workTypeMap = new Map();

  workLogs.forEach(({ workType, hoursWorked, date }) => {
    if (!workTypeMap.has(workType)) {
      workTypeMap.set(workType, { hoursWorked: 0, daysWorkedSet: new Set() });
    }
    const entry = workTypeMap.get(workType);
    entry.hoursWorked += Number(hoursWorked);
    entry.daysWorkedSet.add(date);
  });

  const workTypes = Array.from(workTypeMap.entries()).map(
    ([workType, data]) => {
      const hourlyWage = wagesMap.get(workType) ?? 0;
      const hours = Math.round(data.hoursWorked * 100) / 100; // avoid float drift
      return {
        workType,
        hourlyWage,
        hoursWorked: hours,
        daysWorked: data.daysWorkedSet.size,
        amount: Math.round(hours * hourlyWage),
      };
    },
  );

  const grossFromWork = workTypes.reduce((sum, wt) => sum + wt.amount, 0);

  // ── Transportation allowance ──────────────────────────────────────────
  const transportationAmount = workLogs.reduce(
    (sum, log) => sum + Number(log.transportation),
    0,
  );

  const allowances =
    transportationAmount > 0
      ? [
          {
            type: "transportation",
            label: "Transit Cost",
            amount: transportationAmount,
          },
        ]
      : [];

  // ── Prizes ────────────────────────────────────────────────────────────
  // rewards.prizes is null when no milestone was reached this month
  const prizesDetails = rewards?.prizes?.details ?? [];
  const prizesTotal = rewards?.prizes?.totalForMonths ?? 0;

  // ── Bonuses ───────────────────────────────────────────────────────────
  // rewards.bonuses always has the three tier entries (amount may be 0)
  const bonusesDetails = (rewards?.bonuses?.details ?? []).filter(
    (b) => b.amount > 0,
  );
  const bonusesTotal = rewards?.bonuses?.totalForMonth ?? 0;

  // ── Birthday bonus ────────────────────────────────────────────────────
  const dobMonth = new Date(user.dob).getMonth() + 1; // getMonth() is 0-indexed
  const hasBirthday = dobMonth === Number(month);
  const birthdayBonus = {
    type: "birthdayBonus",
    label: "Birthday",
    amount: hasBirthday ? BIRTHDAY_BONUS_AMOUNT : 0,
  };

  // ── Meals ─────────────────────────────────────────────────────────────
  const mealLogs = workLogs.filter((log) => Number(log.meal) > 0);
  const mealCount = mealLogs.length;
  const mealDeductionAmount = mealLogs.reduce(
    (sum, log) => sum + Number(log.meal),
    0,
  );

  // ─── adjustments ─────────────────────────────────────────────────────────────
  const allAdjustments = workLogs.flatMap((log) =>
    JSON.parse(log.adjustments || "[]"),
  );

  const adjAdditions = allAdjustments.filter((a) => a.type === "addition");
  const adjDeductions = allAdjustments.filter((a) => a.type === "deduction");

  const adjAdditionsTotal = adjAdditions.reduce((sum, a) => sum + a.amount, 0);
  const adjDeductionsTotal = adjDeductions.reduce(
    (sum, a) => sum + a.amount,
    0,
  );

  // ── User fee ──────────────────────────────────────────────────────────
  const userFee = Number(user.userFee) ?? 0;

  // ── Is new user this month ────────────────────────────────────────────
  const joinDate = new Date(user.dateJoined);
  const isNewUser =
    joinDate.getFullYear() === Number(year) &&
    joinDate.getMonth() + 1 === Number(month);

  // ── Totals ────────────────────────────────────────────────────────────
  const allowancesTotal = transportationAmount;
  const rewardsTotal = prizesTotal + bonusesTotal + birthdayBonus.amount;
  const grossTotal =
    grossFromWork + allowancesTotal + rewardsTotal + adjAdditionsTotal;
  const deductionsTotal = mealDeductionAmount + userFee + adjDeductionsTotal;
  const net = grossTotal - deductionsTotal;

  return {
    userId: user.userId,
    payeeName: `${user.firstName} ${user.lastName}`,
    isNewUser,

    grossTotal,
    deductionsTotal,
    net,

    workTypes,

    allowances: [...allowances, ...adjAdditions], // additions appear alongside commuter benefit in gross breakdown

    prizes: prizesDetails, // [] when no milestone reached
    bonuses: bonusesDetails, // always 3 entries, amounts may be 0

    birthdayBonus,

    deductions: [
      {
        type: "meal",
        label: "Meals",
        count: mealCount,
        amount: mealDeductionAmount,
      },
      { type: "userFee", label: "User Fee", amount: userFee },
      ...adjDeductions, // deduction adjustments appear in deductions breakdown
    ],

    summary: {
      workTypes: workTypes.map(({ workType, hoursWorked, daysWorked }) => ({
        workType,
        hoursWorked,
        daysWorked,
      })),
      mealCount,
    },
  };
}

// ─── buildPayslipRow_ (PRIVATE) ──────────────────────────────────────────────────────────
/**
 * Converts a calculated payslip object into a flat array matching the
 * 'payslips' sheet headers exactly.
 *
 * Headers:
 * ["payslipId","referenceNumber","userId","payeeName","year","month",
 *  "isNewUser","issuedAt","grossTotal","deductionsTotal","net",
 *  "workTypesJson","allowancesJson","prizesJson","bonusesJson",
 *  "birthdayBonusJson","deductionsJson","updated_at"]
 *
 * @returns {Array}
 */
function buildPayslipRow_({
  payslipId,
  referenceNumber,
  issuedAt,
  payslip,
  year,
  month,
}) {
  return [
    payslipId,
    referenceNumber,
    payslip.userId,
    payslip.payeeName,
    year,
    month,
    payslip.isNewUser,
    issuedAt,
    payslip.grossTotal,
    payslip.deductionsTotal,
    payslip.net,
    JSON.stringify(payslip.workTypes),
    JSON.stringify(payslip.allowances),
    JSON.stringify(payslip.prizes),
    JSON.stringify(payslip.bonuses),
    JSON.stringify(payslip.birthdayBonus),
    JSON.stringify(payslip.deductions),
    issuedAt, // updated_at
  ];
}

// ─── formatReferenceNumber_ (PRIVATE) ────────────────────────────────────────────────────
/**
 * Generates a payslip reference number.
 * Format: "YYYY-MM-NNNN" e.g. "2026-01-0001"
 *
 * @param {number|string} year
 * @param {number|string} month
 * @param {number} seq
 * @returns {string}
 */
function formatReferenceNumber_(year, month, seq) {
  const mm = String(month).padStart(2, "0");
  const nnnn = String(seq).padStart(4, "0");
  return `${year}-${mm}-${nnnn}`;
}

// ─── READ: getAvailablePayslipPeriod (PUBLIC) ─────────────────────────────────────────────────────────────
/**
 * Reads `payslips` sheet for year and month that are returned to the frontend
 *
 * @returns {Array<{year, month}}
 */
function getAvailablePayslipPeriods() {
  return withSpreadsheet_("getAvailablePayslipPeriods", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.WORKLOGS);
    const [headers, ...rows] = ws.getDataRange().getValues();

    const seen = new Set();
    const periods = [];

    rows.forEach((row) => {
      const logDate = row[3];

      if (logDate instanceof Date && !isNaN(logDate)) {
        const y = logDate.getFullYear();
        const m = logDate.getMonth() + 1;

        const key = `${y}-${String(m).padStart(2, "0")}`;

        if (!seen.has(key)) {
          seen.add(key);
          periods.push({ year: y, month: m });
        }
      }
    });

    return periods.sort((a, b) =>
      b.year !== a.year ? b.year - a.year : b.month - a.month,
    ); //can also be (b.year - a.year || b.month - a.month)
  });
}

// ─── READ: getPayslipsForPeriod(year, month) (PUBLIC) ─────────────────────────────────────────────────────────────
/**
 * Reads payslip and user data for a given period.
 * Returns per-user SUMMARIES for the table AND aggregated payables totals.
 *
 * @param {number|string} year
 * @param {number|string} month
 * @returns {{ summaries: Array, payables: Object }}
 */
function getPayslipsForPeriod(year, month) {
  return withSpreadsheet_("getPayslipsForPeriod", (gs) => {
    const usersWs = gs.getSheetById(SHEET_IDS.USERS);
    const payslipsWs = gs.getSheetById(SHEET_IDS.PAYSLIPS);

    const [, ...userRows] = usersWs.getDataRange().getValues();
    const [, ...payslipRows] = payslipsWs.getDataRange().getValues();

    // ── O(1) lookup: index payslips for this period by userId ────────────────
    const payslipMap = new Map();
    payslipRows.forEach((row) => {
      if (Number(row[4]) === Number(year) && Number(row[5]) === Number(month)) {
        payslipMap.set(row[2], row); // key = userId (index 2)
      }
    });

    // ── Containers ────────────────────────────────────────────────────────────
    const summaries = [];

    const payables = {
      grandGrossTotal: 0,
      grossDeposit: 0,
      grossCash: 0,
      grossWithoutNew: 0,
      netTotal: 0,
      netDeposit: 0,
      netCash: 0,
      totalMealDeductions: 0,
    };

    userRows
      .filter((row) => !row[7]) // exclude users with a dateLeft
      .forEach((row) => {
        const userId = row[0];
        const payslip = payslipMap.get(userId);

        const grossTotal = payslip?.[8] ?? 0;
        const net = payslip?.[10] ?? 0;
        const isNewUser = payslip?.[6] === true;
        const isDeposit = row[5] === "deposit";

        // Per-user summary for SalariesTable
        // null for table display (renders as "-")
        summaries.push({
          userId,
          payeeName: `${row[1]} ${row[2]}`, // firstName lastName - Japanese way
          grossTotal: payslip?.[8] ?? null,
          deductionsTotal: payslip?.[9] ?? null,
          net: payslip?.[10] ?? null,
          updatedAt: payslip?.[17] ?? null,
          status: payslip ? "Calculated" : "Uncalculated",
        });

        // Only accumulate payables for users who have payslip data
        if (payslip) {
          // ── Gross accumulations ───────────────────────────────────────────
          payables.grandGrossTotal += Number(grossTotal);

          if (isDeposit) {
            payables.grossDeposit += Number(grossTotal);
          } else {
            payables.grossCash += Number(grossTotal);
          }

          if (!isNewUser) {
            payables.grossWithoutNew += Number(grossTotal);
          }

          // ── Net accumulations ─────────────────────────────────────────────
          payables.netTotal += Number(net);

          if (isDeposit) {
            payables.netDeposit += Number(net);
          } else {
            payables.netCash += Number(net);
          }

          // ── Meal deductions ───────────────────────────────────────────────
          // deductionsJson is at index 16. MUST guard against non-string values
          const deductionsJson = payslip?.[16];
          const deductions = JSON.parse(
            typeof deductionsJson === "string" ? deductionsJson : "[]",
          );
          const mealAmount =
            deductions.find((d) => d.type === "meal")?.amount ?? 0;
          payables.totalMealDeductions += Number(mealAmount);
        }
      });

    return { summaries, payables };
  });
}

// ─── READ: getPrizesForPeriod (PUBLIC) ─────────────────────────────────────────────────────────────
/**
 * Reads `prize` details from payslip data for a period: year and month
 *
 * @param {number|string} year - Fiscal year
 * @param {number|string} month
 * @returns {Object[]}
 */
function getPrizeWinnersForPeriod(fiscalYear, month) {
  return withSpreadsheet_("getPrizeWinnersForPeriod", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.PAYSLIPS);
    const data = ws.getDataRange().getValues();

    data.shift(); // Memory efficient than [, ...rows] = data

    const namesByType = { TYPE1: [], TYPE2: [], TYPE3: [] };

    for (const row of data) {
      // "CALENDAR Year" row[4]/ col E, and "month" row[5]/col F
      const dataFiscalYear =
        Number(row[5]) >= 4 ? Number(row[4]) : Number(row[4]) - 1;
      if (
        dataFiscalYear === Number(fiscalYear) &&
        Number(row[5]) === Number(month)
      ) {
        try {
          const prizes = JSON.parse(row[13]);
          for (const prize of prizes) {
            const type = prize.type;

            if (namesByType[type]) {
              namesByType[type].push(row[3]);
            } else {
              groupedNames[type] = [row[3]];
            }
          }
        } catch (error) {
          console.error(`Error parsing JSON for user ${row[3]}:`, error);
        }
      }
    }

    return namesByType;
  });
}

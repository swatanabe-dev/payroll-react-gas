// ─── syncMonthlyAttendance_ (PRIVATE) ─────────────────────────────────────────────────────────────
/**
 * processMultiplePayslip with "lock" > syncRewards_ > syncMonthlyAttendance_
 *
 * Fills 'attendanceMonthly' sheet with data to determine if a user attains full attendance
 * Based on the data all worklogs for a given year and month, of each user
 *
 * MODIFIED Version: Generates monthly attendance snapshot
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} gs
 * @param {string|number} year
 * @param {string|number} month
 * @returns {Object} Result of the operation.
 */
function syncMonthlyAttendance_(gs, year, month) {
  const ws = gs.getSheetById(SHEET_IDS.ATTENDANCE);

  // Batch get 1-1
  const attendanceMonthlyData = ws.getDataRange().getValues();
  // Headers: [attendanceId,	userId,	year,	month,	halfDayCounts,	fullDayCounts,	totalDays,	isPrizeAwarded,	isBonusAwarded,	created_at,	updated_at]
  const [headers, ...rows] = attendanceMonthlyData;

  // Batch get 1-2 Get all worklogs for the year & month by user
  // Data shape: [useId:[obj,...,...]]
  const userWorklogs = getWorkLogsForMonth_(gs, year, month);

  // 1. Setup constants
  const numDays = new Date(year, month, 0).getDate();
  const daysForBonus = numDays - NUM_OF_NON_WORKDAYS;
  const today = new Date().toISOString();
  const fiscalYear = Number(month) >= 4 ? Number(year) : Number(year) - 1;

  // 2. Separate data: Rows to update vs. Rows to leave alone for efficiency
  const otherData = [];
  const existingMonthlyMap = new Map();

  rows.forEach((row) => {
    const userId = row[1];
    const rowYear = row[2];
    const rowMonth = row[3];

    if (
      Number(rowYear) === Number(year) &&
      Number(rowMonth) === Number(month)
    ) {
      existingMonthlyMap.set(userId, row);
    } else {
      otherData.push(row);
    }
  });

  // 3. Process the new summaries
  const attendCountSummaries = evaluateAttendanceStatus_(userWorklogs);

  const updatedMonthlyRows = attendCountSummaries.map((summary) => {
    const isPrizeAwarded = summary.totalDays >= DAYS_FOR_PRIZE;
    const isBonusAwarded = summary.totalDays >= daysForBonus;
    const existingRow = existingMonthlyMap.get(summary.userId);

    if (existingRow) {
      // UPDATE existing row array
      existingRow[4] = fiscalYear;
      existingRow[5] = summary.halfDay;
      existingRow[6] = summary.fullDay;
      existingRow[7] = summary.totalDays;
      existingRow[8] = isPrizeAwarded;
      existingRow[9] = isBonusAwarded;
      existingRow[11] = today; // updated_at
      return existingRow;
    } else {
      // INSERT new row array
      return [
        Utilities.getUuid(),
        summary.userId,
        year,
        month,
        fiscalYear,
        summary.halfDay,
        summary.fullDay,
        summary.totalDays,
        isPrizeAwarded,
        isBonusAwarded,
        today, // created_at
        today, // updated_at
      ];
    }
  });

  // 4. Final Reconstruction
  // Combine the "untouched" data with the "newly synced" data
  const finalOutput = [...otherData, ...updatedMonthlyRows];

  // 5. Atomic Write-back
  ws.clearContents(); // Clear to prevent ghosting if the new set is smaller
  ws.getRange(1, 1, 1, headers.length).setValues([headers]);
  ws.getRange(2, 1, finalOutput.length, headers.length).setValues(finalOutput);

  SpreadsheetApp.flush();

  // Build data to return
  // Returns monthly attendance summaries filtered by `fiscalYear` and grouped as {userId:[filteredAttendSummaries]}
  const objMonthlyAttendance = finalOutput.map((row) =>
    Object.fromEntries(row.map((val, i) => [headers[i], val])),
  );
  const filteredAttendance = objMonthlyAttendance.filter(
    (row) => row.fiscalYear === fiscalYear,
  );
  //// Summaries grouped by userId
  return filteredAttendance.reduce((acc, summary) => {
    if (!acc[summary.userId]) acc[summary.userId] = [];
    acc[summary.userId].push(summary);
    return acc;
  }, {});
}

// ─── evaluateAttendanceStatus_ ─────────────────────────────────────────────────────────────
/**
 * Examines worklogs to count half days, full days, total days based on userId
 * @param {Object} worklogs Expects {userId: [obj, ..., obj], ..., userId: [obj, ..., obj]}
 */
function evaluateAttendanceStatus_(worklogs) {
  return Object.keys(worklogs).map((userId) => {
    const summary = { userId, halfDay: 0, fullDay: 0, totalDays: 0 };

    for (const log of worklogs[userId]) {
      const hours = Number(log.hoursWorked);
      if (isNaN(hours)) continue;

      // 0–0.5 hrs counts as worked per client requirement
      if (hours < 4) {
        summary.halfDay++;
      } else {
        summary.fullDay++;
      }
    }

    summary.totalDays = summary.halfDay + summary.fullDay;
    return summary;
  });
}

// ─── getMonthlyPrizeData (PUBLIC) ─────────────────────────────────────────────────────────────
/**
 * For "Prize" page
 * Reads "isPrizeAwarded" {boolean} from the attendanceMonthly sheet and
 * aggregates the info for each user available up to a given year and month
 * @param {number|string} targetYear -
 * @param {number|string} targetMonth -
 * @returns {Object[]} - [userId, name, ]
 *
 */
function getMonthlyPrizeData(targetYear, targetMonth) {
  return withSpreadsheet_("getMonthlyPrizeData", (gs) => {
    const usersWs = gs.getSheetById(SHEET_IDS.USERS);
    const attendanceWs = gs.getSheetById(SHEET_IDS.ATTENDANCE);

    const usersValues = usersWs.getDataRange().getValues();
    const attendanceValues = attendanceWs.getDataRange().getValues();

    const monthToKey = {
      1: "jan",
      2: "feb",
      3: "mar",
      4: "apr",
      5: "may",
      6: "jun",
      7: "jul",
      8: "aug",
      9: "sep",
      10: "oct",
      11: "nov",
      12: "dec",
    };

    // The fiscal position of each calendar month, with April as month 1
    const FISCAL_MONTH_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
    function getFiscalMonthIndex(calendarMonth) {
      return FISCAL_MONTH_ORDER.indexOf(calendarMonth) + 1;
    }

    const targetFiscalMonthIdx = getFiscalMonthIndex(targetMonth);

    // Pivot map with ALL users
    const pivotMap = new Map();

    // Users Sheet: userId (row 0), firstName (row 1), lastName (row 2)
    for (let i = 1; i < usersValues.length; i++) {
      const row = usersValues[i];
      const userId = row[0];
      if (!userId) continue;

      const name = `${row[1]} ${row[2]}`.trim();

      const userRecord = {
        userId,
        name,
        year: targetYear,
        month: targetMonth,
      };

      // Default every fiscal month up to targetMonth's fiscal position to false,
      // in fiscal order (Apr, May, ... up to targetMonth), not calendar order.
      for (let idx = 1; idx <= targetFiscalMonthIdx; idx++) {
        const calMonth = FISCAL_MONTH_ORDER[idx - 1];
        userRecord[monthToKey[calMonth]] = false;
      }

      pivotMap.set(userId, userRecord);
    }

    // Attendance Sheet: userId (1), month (3), fiscalYear (4), isPrizeAwarded (8)
    for (let i = 1; i < attendanceValues.length; i++) {
      const row = attendanceValues[i];
      const userId = row[1];
      const recordMonth = row[3];
      const recordFiscalYear = row[4];
      const isPrizeAwarded = row[8] === true;

      if (!userId || recordFiscalYear !== targetYear) continue;

      const recordFiscalMonthIdx = getFiscalMonthIndex(recordMonth);
      if (recordFiscalMonthIdx > targetFiscalMonthIdx) continue;

      if (pivotMap.has(userId) && isPrizeAwarded) {
        const monthKey = monthToKey[recordMonth];
        if (monthKey) {
          pivotMap.get(userId)[monthKey] = true;
        }
      }
    }

    return Array.from(pivotMap.values());
  });
}

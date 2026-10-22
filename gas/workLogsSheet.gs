// ─── CREATE & UPDATE: addWorkLog  ─────────────────────────────────────────────────────────────
/**
 * Saves (CREATES and UPDATES) a new/existing work type setting
 * @param {Object} payload
 * @param {string} userId - The FK to search for a user specific data
 * @param {string} name
 * @param {string} date - ISOString from the frontend
 * @param {number|string} hoursWorked
 * @param {number|string} meal
 * @param {number|string} transportation
 * @param {Object[]} adjustments - [{type, label, amount}]
 * @returns {Object} Result of the operation.
 */
function addWorkLog({
  userId,
  name,
  date,
  workType,
  hoursWorked,
  meal,
  transportation,
  adjustments,
}) {
  return withScriptLock_("addWorkLog", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.WORKLOGS);
    const now = new Date().toISOString();

    const trimmedUserId = String(userId || "").trim();
    const trimmedName = String(name || "").trim();
    const trimmedDate = String(date || "").trim();
    const trimmedWorkType = String(workType || "").trim();
    const formattedHoursWorked = parseFloat(hoursWorked || 0);
    const formattedMeal = Number(meal || 0);
    const formattedTransportation = Number(transportation || 0);
    const trimmedAdjustments = String(adjustments || "[]").trim();

    // NOTE: 'adjustments' is optional
    if (
      !trimmedUserId ||
      !trimmedName ||
      !trimmedDate ||
      !trimmedWorkType ||
      isNaN(formattedHoursWorked) ||
      isNaN(formattedMeal) ||
      isNaN(formattedTransportation)
    ) {
      throw new Error("Invalid input: Ensure all fields are filled correctly.");
    }

    const newId = Utilities.getUuid();

    ws.appendRow([
      newId,
      trimmedUserId,
      trimmedName,
      trimmedDate,
      trimmedWorkType,
      formattedHoursWorked,
      formattedMeal,
      formattedTransportation,
      trimmedAdjustments,
      now,
      now,
    ]);
    return {
      success: true,
      action: "created",
      message: `New worklog with ID #${newId}`,
    };
  });
}

// ─── READ: getPaginatedWorkLogs ─────────────────────────────────────────────────────────────
/**
 * Reads all worklogs specific to a user
 * @param {number|string} from
 * @param {number|string} to
 * @returns {Object} Result of the operation.
 */
function getPaginatedWorkLogs(from, to, category, searchWord) {
  return withSpreadsheet_("getPaginated", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.WORKLOGS);
    const allData = ws.getDataRange().getValues();

    // If allData is empty, .getValues() returns [[""]]. BE CAREFUL!!
    if (allData.length <= 1) {
      return { success: true, status: "empty", worklogs: [], count: 0 };
    }

    // shift(): Way less memory usage than [headers, ...rows] = allData. "...rows" makes another copy
    const headers = allData.shift();
    let dataRows = allData;

    // Descending. Given that, new entries are stored every new day. Not logical sorting
    dataRows.reverse();

    // Filter if search criteria exists
    if (category && searchWord) {
      const colIndex = headers.indexOf(category);

      if (colIndex !== -1) {
        const lowerSearchWord = String(searchWord).toLowerCase();

        dataRows = dataRows.filter((row) => {
          const cellValue = formatDateNative_(row[colIndex]);

          return String(cellValue).toLowerCase().includes(lowerSearchWord);
        });
      }
    }

    // of the FILTERED data
    const totalCount = dataRows.length;

    // Pagination based on the filtered dataset
    const paginatedRows = dataRows.slice(from, to + 1);

    const paginatedWorklogs = paginatedRows.map((row) => {
      const worklog = {};
      headers.forEach((field, i) => {
        let value = row[i];
        if (field === "date") {
          value = formatDateNative_(value);
        }

        worklog[field] = value;
      });
      return worklog;
    });

    return {
      success: true,
      action: "read_paginated_worklogs",
      worklogs: paginatedWorklogs,
      count: totalCount,
    };
  });
}

// ─── READ: getWorkLogsForMonth_() (PRIVATE) ─────────────────────────────────────────────────────────────
// THIS FUNCTION IS VITAL used in many places. KEEP THIS.
/**
 * Reads logs that match 'year' and 'month' provided
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} gs
 * @param {string|number} year
 * @param {string|number} month
 * @returns {Array<Object>} List of worklog objects.
 */
function getWorkLogsForMonth_(gs, year, month) {
  const ws = gs.getSheetById(SHEET_IDS.WORKLOGS);
  const data = ws.getDataRange().getValues();

  if (data.length < 2) return [];

  const [headers, ...rows] = data;

  const dateIdx = headers.indexOf("date");

  const filteredWorklogs = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawDate = row[dateIdx];

    if (
      rawDate.getFullYear() !== Number(year) ||
      rawDate.getMonth() + 1 !== Number(month)
    ) {
      continue;
    }

    const worklog = {};
    for (let j = 0; j < headers.length; j++) {
      let value = row[j];
      worklog[headers[j]] = value;
    }
    filteredWorklogs.push({
      ...worklog,

      date: formatDateNative_(worklog.date),
    });
  }

  const filteredWorkLogsByUser = filteredWorklogs.reduce(
    (acc, filteredWorklog) => {
      if (!acc[filteredWorklog.userId]) acc[filteredWorklog.userId] = [];
      acc[filteredWorklog.userId].push(filteredWorklog);
      return acc;
    },
    {},
  );
  return filteredWorkLogsByUser;
}

// ─── READ: getUserWorklogsForPeriod ─────────────────────────────────────────────────────────────
/**
 * Reads all work logs at once, then filers by userId, year, month
 *
 * Used in UserWorkStatus.jsx, a part of the "User" page
 *
 * @param {string} userId
 * @param {string|number} userId
 * @param {string|number} userId
 * @returns {Object[]}
 */
function getUserWorklogsForPeriod(userId, year, month) {
  return withSpreadsheet_("getUserWorklogsForPeriod", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.WORKLOGS);

    const allWorklogs = ws.getDataRange().getValues();
    const headers = allWorklogs.shift();

    // Cast parameters ONCE outside the loop to save processing time
    const targetUserId = String(userId);
    const targetYear = Number(year);
    const targetMonth = Number(month);

    const filteredWorklogs = allWorklogs.filter((row) => {
      const rowUserId = row[1];
      const rowDate = row[3];

      if (!rowUserId || !rowDate) return false;

      let rowYear, rowMonth;

      if (rowDate instanceof Date) {
        rowYear = rowDate.getFullYear();
        rowMonth = rowDate.getMonth() + 1;
      } else {
        // Fallback just in case a cell was formatted as plain text
        const parsedDate = new Date(rowDate);
        if (isNaN(parsedDate.getTime())) return false;
        rowYear = parsedDate.getFullYear();
        rowMonth = parsedDate.getMonth() + 1;
      }

      return (
        String(rowUserId) === targetUserId &&
        rowYear === targetYear &&
        rowMonth === targetMonth
      );
    });

    const userWorklogs = filteredWorklogs.map((row) => {
      const worklog = {};
      headers.forEach((header, i) => {
        let value = row[i];

        if (header === "date") {
          value = formatDateNative_(value);
        }

        worklog[header] = value;
      });
      return worklog;
    });

    return userWorklogs;
  });
}

// ─── UPDATE: updateWorkLog ─────────────────────────────────────────────────────────────
/**
 * Update a worklog specific to a user
 * @param {Object}
 * @param {string} workLogId - The ID to search for in Column A.
 * @param {string} userId - The ID to search for in Column B.
 * @param {string} name
 * @param {string} date - Converted to an ISO string
 * @param {string} workType - One of the work log dropdown items.
 * @param {number|string} hoursWorked
 * @param {number|string} meal
 * @param {number|string} transportation
 * @param {number|string} transportation
 * @returns {Object} Result of the operation.
 */
function updateWorkLog({
  workLogId,
  userId,
  name,
  date,
  workType,
  hoursWorked,
  meal,
  transportation,
  adjustments,
}) {
  return withScriptLock_("update_worklog", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.WORKLOGS);
    const now = new Date().toISOString();

    const rows = ws.getDataRange().getValues();

    if (rows.length < 2) {
      throw new Error("Sheet is empty or only contains headers.");
    }

    // const [headers, ...rows] = dataRange;
    const headers = rows.shift();

    // In-memory array search for the workLogId
    const rowIndex = rows.findIndex(
      (row) => String(row[0]) === String(workLogId),
    );

    // Note: findIndex returns -1 if not found a match
    if (rowIndex === -1) {
      throw new Error(`Work log ID ${workLogId} not found.`);
    }

    // Calculate actual sheet row: +1 for 0-indexing fallback, +1 for header row offset, so +2 in total
    const rowToUpdate = rowIndex + 2;

    // Grab created_at timestamp from memory to preserve
    const historicalCreatedAt = rows[rowIndex][9]; // Column 10 is index 9

    const trimmedUserId = String(userId || "").trim();
    const trimmedName = String(name || "").trim();
    const trimmedDate = String(date || "").trim();
    const trimmedWorkType = String(workType || "").trim();
    const formattedHoursWorked = parseFloat(hoursWorked || 0);
    const formattedMeal = Number(meal || 0);
    const formattedTransportation = Number(transportation || 0);
    const trimmedAdjustments = String(adjustments || "[]").trim();

    if (
      !trimmedUserId ||
      !trimmedName ||
      !trimmedDate ||
      !trimmedWorkType ||
      isNaN(formattedHoursWorked) ||
      isNaN(formattedMeal) ||
      isNaN(formattedTransportation)
    ) {
      throw new Error(
        "Invalid input: Ensure all required fields are filled correctly.",
      );
    }

    const updatedRowSlice = [
      trimmedUserId, // Col 2
      trimmedName, // Col 3
      trimmedDate, // Col 4
      trimmedWorkType, // Col 5
      formattedHoursWorked, // Col 6
      formattedMeal, // Col 7
      formattedTransportation, // Col 8
      trimmedAdjustments, // Col 9
      historicalCreatedAt, // Col 10
      now, // Col 11 (updated_at)
    ];

    // Write the updated row back to the sheet
    ws.getRange(rowToUpdate, 2, 1, 10).setValues([updatedRowSlice]);
  });
}

// ─── DELETE: deleteWorkLog ─────────────────────────────────────────────────────────────
/**
 * Deletes a row by ID and returns a status object.
 * @param {string} id - The ID to search for in Column A.
 * @return {Object} Result of the operation.
 */
function deleteWorkLog(id) {
  return withScriptLock_("delete_worklog", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.WORKLOGS);
    const lastRow = ws.getLastRow();

    if (lastRow < 2) {
      return {
        success: false,
        action: "delete_worklog",
        message: "Sheet is empty or only contains headers.",
      };
    }

    const logIds = ws
      .getRange(2, 1, lastRow - 1, 1)
      .getDisplayValues()
      .flat();

    const matchingIndex = logIds.indexOf(id);

    if (matchingIndex !== -1) {
      const rowToDelete = matchingIndex + 2;

      ws.deleteRow(rowToDelete);

      return {
        success: true,
        action: "delete_worklog",
        message: `Deleted ID #${id} at row ${rowToDelete}`,
      };
    }

    return {
      success: false,
      action: "delete_worklog",
      message: `ID #${id} was not found in the spreadsheet.`,
    };
  });
}

// ─── READ: getUnarchivedFiscalYears ─────────────────────────────────────────────────────────────
/**
 *
 * @returns {Array}
 */
function getUnarchivedFiscalYears() {
  return withSpreadsheet_("getUnarchivedFiscalYears", (gs) => {
    const archivesWs = gs.getSheetById(SHEET_IDS.ARCHIVES);
    const workLogsWs = gs.getSheetById(SHEET_IDS.WORKLOGS);

    const lastRow = workLogsWs.getLastRow();

    /**@type {Object[]} - [] if no data */
    const archives = getArchives_(archivesWs);
    const archivedFYs = archives.map((a) => Number(a.fiscalYear)) ?? []; // ?? [] Just in case

    if (lastRow < 2) return [];

    // Fetch ONLY Column D "date"
    const dateValues = workLogsWs.getRange(2, 4, lastRow - 1, 1).getValues();

    const today = new Date();
    // Current Fiscal Year (April - March)
    const currentFY =
      today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();

    const previousFYs = new Set();

    for (let i = 0; i < dateValues.length; i++) {
      const dateStr = dateValues[i][0];

      // Just in case
      if (!dateStr) continue;

      const logDate = new Date(dateStr);
      const logYear = logDate.getFullYear();
      const logFY = logDate.getMonth() < 3 ? logYear - 1 : logYear;

      if (logFY < currentFY) {
        previousFYs.add(logFY);
      }
    }

    //  Spread the Set into a unique array when returning
    const worklogsFYs = [...previousFYs];
    const availableFYs = worklogsFYs.filter((y) => !archivedFYs.includes(y));

    return availableFYs;
  });
}

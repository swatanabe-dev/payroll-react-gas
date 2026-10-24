// MEMO: Archiving is completed in three steps: make a copy, verify it, and delete old data
// IMPORTANT!!: For this feature to work, grant access to "Google Drive" under
// "oauthScopes" in "appsscript.json"

// STEP1: Make a full COPY - Entry point
// ─── READ & CREATE: archiveFiscalYear (PUBLIC) - Entry point for making a copy (archive) ───────────────
/**
 * Creates a full copy of the active spreadsheet into the Archive folder,
 * records it in the archives tab, and returns the new archive row.
 * @param {string | number} fiscalYear - e.g. "2025" (meaning FY2025, Apr 2025–Mar 2026)
 * @param {string} authorizedBy
 * @returns {Object} the archive record that was written
 */
function archiveFiscalYear({ fiscalYear, authorizedBy }) {
  return withScriptLock_(
    "archiveFiscalYear",
    (gs) => {
      const sourceFile = DriveApp.getFileById(gs.getId());
      const archiveFolder = getArchiveFolder_(gs); // This creates the target folder if it does not exist
      const ws = gs.getSheetById(SHEET_IDS.ARCHIVES);

      const fileName = `FY${fiscalYear}-data`;

      const archives = getArchives_(ws);
      // Guard against accidental double-archiving of the same FY
      const existing = archives.find(
        (a) => Number(a.fiscalYear) === Number(fiscalYear),
      );
      if (existing) {
        throw new Error(
          `FY${fiscalYear} has already been archived (archiveId: ${existing.archiveId}).`,
        );
      }

      const rowCounts = getRowCountsForAllSheets_(gs);

      const copiedFile = sourceFile.makeCopy(fileName, archiveFolder);

      const record = {
        archiveId: Utilities.getUuid(),
        fiscalYear: fiscalYear,
        fileId: copiedFile.getId(),
        fileUrl: copiedFile.getUrl(),
        sheetRowCountsJson: JSON.stringify(rowCounts),
        createdAt: new Date().toISOString(),
        createdBy: authorizedBy,
        verifiedAt: "",
        verifiedBy: "",
        verificationDetailsJson: "",
        purgedAt: "",
        purgedBy: "",
      };

      ws.appendRow([
        record.archiveId,
        record.fiscalYear,
        record.fileId,
        record.fileUrl,
        record.sheetRowCountsJson,
        record.createdAt,
        record.createdBy,
        record.verifiedAt,
        record.verifiedBy,
        record.verificationDetailsJson,
        record.purgedAt,
        record.purgedBy,
      ]);
      return record;
    },
    30000,
  );
}

// STEP2: Verify the copy from the PART1 above is trustworthy
// ─── READ & UPDATE verifyArchive (PUBLIC) - Entry point for verification ───────────────────────────
/**
 * Opens the archived copy, compares its row counts against the counts
 * recorded at archive time, and marks the record verified if they match.
 * @param {string} archiveId
 * @param {string} authorizedBy
 * @returns {Object} { verified: boolean, details: Object }
 */
function verifyArchive({ archiveId, authorizedBy }) {
  return withScriptLock_(
    "verifyArchive",
    (gs) => {
      const originalWs = gs.getSheetById(SHEET_IDS.ARCHIVES);
      const archivesData = originalWs.getDataRange().getValues(); // Sheet call #1
      const archivesHeaders = archivesData[0];
      const archivesRows = archivesData.slice(1);

      // record = 'archives' sheet record
      const record = getArchiveRecordById_(
        archivesHeaders,
        archivesRows,
        archiveId,
      );
      if (!record)
        throw new Error(`No archive record found for archiveId: ${archiveId}`);

      // From the original, not the copy
      const expectedCounts = JSON.parse(record.sheetRowCountsJson);

      // From the copy (archived)
      const archivedWs = SpreadsheetApp.openById(record.fileId);
      const actualCounts = getRowCountsForAllSheets_(archivedWs); // Sheet call #2

      const details = {};
      let allMatch = true;

      Object.keys(expectedCounts).forEach((sheetName) => {
        const expected = expectedCounts[sheetName];
        const actual = actualCounts[sheetName] ?? null;
        const match = actual === expected;
        if (!match) allMatch = false;
        details[sheetName] = { expected, actual, match };
      });

      const now = new Date().toISOString();
      updateArchiveRecord_(originalWs, archivesHeaders, record, {
        verifiedAt: allMatch ? now : "",
        verifiedBy: allMatch ? authorizedBy : "",
        verificationDetailsJson: JSON.stringify(details),
      }); // Sheet call #3

      return { verified: allMatch, details };
    },
    3000,
  );
}

// STEP3: Purge (delete) all unnecessary data from the app database (original sheets)
// ─── purgePrevFyData (PUBLIC) - Entry point for purging ─────────────────────────────────────────────────
/**
 * @param {string | number} targetFY
 * @param {string} authorizedBy
 * @returns {Object} { verified: boolean, details: Object }
 */
function purgePrevFyData({ archiveId, targetFY, authorizedBy }) {
  return withScriptLock_(
    "purgePrevFyData",
    (gs) => {
      // Get all sheets once to avoid multiple API calls
      const allSheets = gs.getSheets();
      const getSheet = (id) =>
        allSheets.find((s) => String(s.getSheetId()) === String(id));

      // Track which users are deleted to cascade delete their savings
      const deletedUserIds = new Set();
      const targetFYStr = String(targetFY);

      // ─── 1. PROCESS USERS ───────────────────────────────────────────
      {
        const sheet = getSheet(SHEET_IDS.USERS);
        if (sheet) {
          const data = sheet.getDataRange().getValues();
          if (data.length > 1) {
            const header = data[0];
            const rows = data.slice(1);

            const userIdIdx = header.indexOf("userId");
            const dateLeftIdx = header.indexOf("dateLeft");

            const remainingRows = rows.filter((row) => {
              const dateLeft = row[dateLeftIdx];
              // If dateLeft exists and falls in the target FY, mark for deletion
              if (
                dateLeft &&
                String(getFyFromDate_(dateLeft)) === targetFYStr
              ) {
                deletedUserIds.add(row[userIdIdx]);
                return false; // Remove row
              }
              return true; // Keep row
            });

            writeBackData_(sheet, header, remainingRows);
          }
        }
      }

      // ─── 2. PROCESS SAVINGS (Cascade) ───────────────────────────────
      {
        const sheet = getSheet(SHEET_IDS.SAVINGS);
        if (sheet && deletedUserIds.size > 0) {
          // Only run if we actually deleted users
          const data = sheet.getDataRange().getValues();
          if (data.length > 1) {
            const header = data[0];
            const rows = data.slice(1);
            const userIdIdx = header.indexOf("userId");

            // Keep rows where the userId is NOT in the deleted set
            const remainingRows = rows.filter(
              (row) => !deletedUserIds.has(row[userIdIdx]),
            );
            writeBackData_(sheet, header, remainingRows);
          }
        }
      }

      // ─── 3. PROCESS WORKLOGS ────────────────────────────────────────
      {
        const sheet = getSheet(SHEET_IDS.WORKLOGS);
        if (sheet) {
          const data = sheet.getDataRange().getValues();
          if (data.length > 1) {
            const header = data[0];
            const rows = data.slice(1);
            const dateIdx = header.indexOf("date");

            // Keep rows that DO NOT match targetFY
            const remainingRows = rows.filter(
              (row) => String(getFyFromDate_(row[dateIdx])) !== targetFYStr,
            );
            writeBackData_(sheet, header, remainingRows);
          }
        }
      }

      // ─── 4. PROCESS ATTENDANCE & REWARDS ────────────────────────────
      // loop them because both use the exact same logic (fiscalYear column)
      [SHEET_IDS.ATTENDANCE, SHEET_IDS.REWARDS].forEach((sheetId) => {
        const sheet = getSheet(sheetId);
        if (sheet) {
          const data = sheet.getDataRange().getValues();
          if (data.length > 1) {
            const header = data[0];
            const rows = data.slice(1);
            const fyIdx = header.indexOf("fiscalYear");

            const remainingRows = rows.filter(
              (row) => String(row[fyIdx]) !== targetFYStr,
            );
            writeBackData_(sheet, header, remainingRows);
          }
        }
      });

      // ─── 5. PROCESS PAYSLIPS ────────────────────────────────────────
      {
        const sheet = getSheet(SHEET_IDS.PAYSLIPS);
        if (sheet) {
          const data = sheet.getDataRange().getValues();
          if (data.length > 1) {
            const header = data[0];
            const rows = data.slice(1);
            const yearIdx = header.indexOf("year");
            const monthIdx = header.indexOf("month");

            const remainingRows = rows.filter((row) => {
              const rowFY = getFiscalYear_(row[yearIdx], row[monthIdx]);
              return String(rowFY) !== targetFYStr;
            });

            writeBackData_(sheet, header, remainingRows);
          }
        }
      }

      // ─── 6. UPDATE ARCHIVES LOG ───────────────────────────────────────
      {
        const archivesWs = getSheet(SHEET_IDS.ARCHIVES);
        if (archivesWs && archiveId) {
          const archivesData = archivesWs.getDataRange().getValues();
          const archivesHeaders = archivesData[0];
          const archivesRows = archivesData.slice(1);

          // Fetch the record
          const record = getArchiveRecordById_(
            archivesHeaders,
            archivesRows,
            archiveId,
          );

          if (!record) {
            throw new Error(`Archive record with ID ${archiveId} not found.`);
          }

          const now = new Date().toISOString();
          updateArchiveRecord_(archivesWs, archivesHeaders, record, {
            purgedAt: now,
            purgedBy: authorizedBy,
          });
        }
      }

      return {
        success: true,
        action: "purgePrevFyData",
        message: `Successfully purged data for FY ${targetFY}. Users removed: ${deletedUserIds.size}`,
      };
    },
    30000,
  );
}

// ─── READ: getArchives (PUBLIC) ─────────────────────────────────────────────────────────────
/**
 * Returns all archive records, sorted by fiscalYear descending (most recent first).
 * @returns {Array<Object>} array of archive records
 */
function getArchives() {
  return withSpreadsheet_("getArchives", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.ARCHIVES);
    if (!ws) throw new Error(`Sheet not found: ID "${SHEET_IDS.ARCHIVES}"`);

    const data = ws.getDataRange().getValues();
    // NOTE: .getValues() returns [[""]] when the sheet is empty. In JS, [[""]}.length is 1
    if (data.length < 2 && data[0][0] === "") return [];

    const [headers, ...rows] = data;

    const archives = rows.map((row) => {
      const archive = {};

      headers.forEach((header, i) => {
        let value = row[i];

        if (value instanceof Date) {
          if (
            header === "createdAt" ||
            header === "verifiedAt" ||
            header === "purgedAt"
          ) {
            // Manually format DOB to isolate local dates and fix the timezone shift
            const rowYear = value.getFullYear();
            const rowMonth = String(value.getMonth() + 1).padStart(2, "0");
            const rowDate = String(value.getDate()).padStart(2, "0");
            value = `${rowYear}-${rowMonth}-${rowDate}`;
          }
        }
        archive[header] = value;
      });
      return archive;
    });
    return archives.sort((a, b) => b.fiscalYear - a.fiscalYear);
  });
}

// ─── READ: getArchives_ "PRIVATE/INTERNAL CALL" ─────────────────────────────────────────────────────────────
/**
 * Reads and returns all "archives" sheet data
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet.getSheetById(SHEET_IDS.ARCHIVES)} ws
 * @returns {Array<Object>} array of archive records
 */
function getArchives_(ws) {
  if (!ws) throw new Error(`Sheet not found: ID "${SHEET_IDS.ARCHIVES}"`);

  const data = ws.getDataRange().getValues();
  // NOTE: .getValues() returns [[""]] when the sheet is empty. In JS, [[""]}.length is 1
  if (data.length < 2 && data[0][0] === "") return [];

  const [headers, ...rows] = data;

  return rows.map((row) => {
    const archive = {};

    headers.forEach((header, i) => {
      let value = row[i];

      if (value instanceof Date) {
        if (
          header === "createdAt" ||
          header === "verifiedAt" ||
          header === "purgedAt"
        ) {
          // Manually format DOB to isolate local dates and fix the timezone shift
          const rowYear = value.getFullYear();
          const rowMonth = String(value.getMonth() + 1).padStart(2, "0");
          const rowDate = String(value.getDate()).padStart(2, "0");
          value = `${rowYear}-${rowMonth}-${rowDate}`;
        }
      }
      archive[header] = value;
    });
    return archive;
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// ─── Archives sheet helper functions ─────────────────────────────────────────────────────────────
// NOTE: The constants, if any, are on `constants.gs`

// ─── getRowCountsForAllSheets_ ─────────────────────────────────────────────────────────────
/**
 * @param {Spreadsheet} gs - SpreadsheetApp.getActiveSpreadsheet();
 * @returns {Object} map of sheetName -> data row count (excluding header)
 */
function getRowCountsForAllSheets_(gs) {
  const counts = {};
  gs.getSheets().forEach((sheet) => {
    const lastRow = sheet.getLastRow();

    counts[sheet.getName()] = lastRow === 0 ? 0 : lastRow - 1;
  });
  return counts;
}

// ─── getArchiveFolder_ ─────────────────────────────────────────────────────────────
/**
 * @param {Spreadsheet} gs
 * @returns {Folder} the "Archive" subfolder, created if it doesn't exist
 */
function getArchiveFolder_(gs) {
  const parentIterator = DriveApp.getFileById(gs.getId()).getParents(); // payroll-app dir

  if (!parentIterator.hasNext()) {
    throw new Error("Could not find a parent folder for this spreadsheet.");
  }

  const parent = parentIterator.next(); // payroll-app dir
  const folders = parent.getFoldersByName("payroll-archives");
  return folders.hasNext()
    ? folders.next()
    : parent.createFolder("payroll-archives");
}

// ─── appendArchiveRecord_ for creating the first record for the 3-step archiving process ────────
function appendArchiveRecord_({
  archiveId,
  fiscalYear,
  fileId,
  fileUrl,
  sheetRowCountsJson,
  createdAt,
  createdBy,
  verifiedAt,
  verifiedBy,
  verificationDetailsJson,
  purgedAt,
  purgedBy,
}) {
  sheet.appendRow([
    archiveId,
    fiscalYear,
    fileId,
    fileUrl,
    sheetRowCountsJson,
    createdAt,
    createdBy,
    verifiedAt,
    verifiedBy,
    verificationDetailsJson,
    purgedAt,
    purgedBy,
  ]);
}

// ─── updateArchiveRecord_  ───────────────────────────────────────
/**
 * Updates an archive record
 * @param {Sheet} sheet - The 'archives' sheet object.
 * @param {Array<string>} headers
 * @param {Object} record - The existing record object (must contain rowIndex).
 * @param {Object} updates - The fields to update { fieldName: newValue }.
 */
function updateArchiveRecord_(sheet, headers, record, updates) {
  if (!record || !record.rowIndex) {
    throw new Error("Invalid archive record provided.");
  }

  const updatedRecord = { ...record, ...updates };

  const newRowValues = headers.map((header) => {
    return updatedRecord[header] !== undefined ? updatedRecord[header] : "";
  });

  // getRange(row, column, numRows, numColumns)
  sheet
    .getRange(record.rowIndex, 1, 1, headers.length)
    .setValues([newRowValues]);
}

// ─── writeBackData_ for purging data ─────────────────────────────────────────────────────────────
/**
 * Writes back all data that should remain in the sheets for operation in one go.
 *
 * @param {Sheet} sheet
 * @param {Array<string>} headers
 * @param {Array} remainingRows
 */
function writeBackData_(sheet, header, remainingRows) {
  sheet.clearContents(); // Fast bulk clear
  if (remainingRows.length > 0) {
    const output = [header, ...remainingRows];
    sheet.getRange(1, 1, output.length, output[0].length).setValues(output);
  } else {
    // If everything was deleted, just put the header back
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  }
}

/**
 * @returns {Object|null} archive record with 1-based rowIndex attached, or null
 */
function getArchiveRecordById_(headers, data, archiveId) {
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === archiveId) {
      return rowToArchiveRecord_(headers, data[i], i + 2);
    }
  }
  return null;
}

function rowToArchiveRecord_(headers, rowValues, rowIndex) {
  const record = {};

  headers.forEach((header, idx) => {
    record[header] = rowValues[idx];
  });

  record.rowIndex = rowIndex;

  return record;
}

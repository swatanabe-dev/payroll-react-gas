// ─── CREATE | UPDATE: saveHourlyWageSetting ─────────────────────────────────────────────────────────────
/**
 * Saves (CREATES and UPDATES) a new/existing work type setting
 * Create and update are not separated due to accommodate a form with
 * flexible/dynamic input fields
 * @param {string} id - The ID to search for in Column A.
 * @param {string} workType
 * @param {string|number} hourlyWage
 * @returns {Object} Result of the operation.
 */
function saveHourlyWageSetting({ hourlyWageId: id, workType, hourlyWage }) {
  return withScriptLock_("saveHourlyWageSetting", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.HOURLY_RATE);
    const lastRow = ws.getLastRow();
    const now = new Date().toISOString();

    const trimmedWorkType = String(workType || "").trim();
    const formattedHourlyWage = Number(hourlyWage);

    if (!trimmedWorkType || isNaN(formattedHourlyWage)) {
      throw new Error("Invalid input: Ensure all fields are filled correctly.");
    }

    // CREATE NEW
    // When "id" is empty, the incoming data is a new entry
    if (!id || id === "") {
      const newId = Utilities.getUuid();

      ws.appendRow([
        newId,
        trimmedWorkType,
        formattedHourlyWage,
        now, // Column 4 (D): created_at
        now, // Column 5 (E): updated_at
      ]);

      return {
        success: true,
        action: "CREATE_HOURLY_RATE",
        message: `New setting created with ID #${newId}`,
      };
    }

    // UPDATE EXISTING
    const hourlyWageIds =
      lastRow > 1
        ? ws
            .getRange(2, 1, lastRow - 1, 1)
            .getDisplayValues()
            .flat()
        : [];

    const matchingIndex = hourlyWageIds.indexOf(String(id));

    // The above returns -1 to account for a case where no matching id exists
    if (matchingIndex === -1) {
      throw new Error(`Hourly Wage ID ${id} not found.`);
    }

    const rowToUpdate = matchingIndex + 2;

    //  Update except for 'created_at' at Col4 (D).
    // Ensure to use .setValues(), not .setValue()
    ws.getRange(rowToUpdate, 2, 1, 2).setValues([
      [trimmedWorkType, formattedHourlyWage],
    ]);
    ws.getRange(rowToUpdate, 5).setValue(now); // Col 5 (E) - updated_at

    return {
      success: true,
      action: "UPDATE_HOURLY_RATE",
      message: `ID #${id} has been updated.`,
    };
  });
}

// ─── READ: getHourlyWageSettings (PUBLIC) ─────────────────────────────────────────────────────────────
/**
 * Reads work type settings as an array of objects.
 * @return {Array<Object>} List of hourly rate objects.
 */
function getHourlyWageSettings() {
  return withSpreadsheet_("getHourlyWageSettings", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.HOURLY_RATE);
    const data = ws.getDataRange().getValues();
    const [headers, ...rows] = data;

    const hourlyWages = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const wageSetting = {};
      for (let j = 0; j < headers.length; j++) {
        let value = row[j];
        wageSetting[headers[j]] = value;
      }
      hourlyWages.push(wageSetting);
    }

    return hourlyWages;
  });
}

// ─── READ: getHourlyWageSettings_ (PRIVATE) ─────────────────────────────────────────────────────────────
/**
 * Reads work type settings as an array of objects.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} gs
 * @return {Array<Object>} List of hourly rate objects.
 */
function getHourlyWageSettings_(gs) {
  const ws = gs.getSheetById(SHEET_IDS.HOURLY_RATE);
  const data = ws.getDataRange().getValues();

  const [headers, ...rows] = data;

  const hourlyWages = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const wageSetting = {};
    for (let j = 0; j < headers.length; j++) {
      let value = row[j];
      wageSetting[headers[j]] = value;
    }
    hourlyWages.push(wageSetting);
  }

  return hourlyWages;
}

// DELETE
/**
 * Deletes a row by ID and returns a status object.
 * @param {string} id - The ID to search for in Column A.
 * @return {Object} Result of the operation.
 */
function deleteHourlyWageSetting(id) {
  return withScriptLock_("deleteHourlyWageSetting", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.HOURLY_RATE);
    const lastRow = ws.getLastRow();

    // Handle empty sheets (only header or less)
    if (lastRow < 2) {
      return {
        success: false,
        action: "DELETE_HOURLY_RATE",
        message: "Sheet is empty or only contains headers.",
      };
    }

    const hourlyWageIds = ws
      .getRange(2, 1, lastRow - 1, 1)
      .getDisplayValues()
      .flat();

    const matchingIndex = hourlyWageIds.indexOf(id);

    if (matchingIndex !== -1) {
      const rowToDelete = matchingIndex + 2;
      ws.deleteRow(rowToDelete);

      return {
        success: true,
        action: "DELETE_HOURLY_RATE",
        message: `Deleted ID #${id} at row ${rowToDelete}.`,
      };
    }

    return {
      success: false,
      action: "DELETE_HOURLY_RATE",
      message: `ID #${id} was not found in the spreadsheet.`,
    };
  });
}

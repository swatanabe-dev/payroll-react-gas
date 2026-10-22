// ─── CREATE & UPDATE: saveWorkTypeSetting ─────────────────────────────────────────────────────────────
/**
 * Saves (CREATES and UPDATES) a new/existing work type setting
 * Not separated to accommodate a form with flexible/dynamic input fields
 *
 * @param {string} id - The ID to search for in Column A.
 * @param {string} workType - One of the work log dropdown items.
 * @param {string} optionName - One of the work log dropdown items
 * @param {string|number} optionValue
 * @returns {Object} Result of the operation.
 */
function saveWorkTypeSetting({
  workTypeId: id,
  workType,
  optionName,
  optionValue,
}) {
  return withScriptLock_("saveWorkTypeSettings", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.WORK_TYPE);
    const lastRow = ws.getLastRow();
    const now = new Date().toISOString();

    const trimmedWorkType = String(workType || "").trim();
    const trimmedOptionName = String(optionName || "").trim();
    const formattedOptionValue = Number(optionValue);

    if (!trimmedWorkType || !trimmedOptionName || isNaN(formattedOptionValue)) {
      throw new Error("Invalid input: Ensure all fields are filled correctly.");
    }

    // CREATE NEW
    // When 'id' is an empty string, the incoming data is a new entry
    if (!id || id === "") {
      const newId = Utilities.getUuid();

      ws.appendRow([
        newId,
        trimmedWorkType,
        trimmedOptionName,
        formattedOptionValue,
        now, // Column 5: created_at
        now, // Column 6: updated_at
      ]);

      return {
        success: true,
        action: "create_work_type",
        message: `New setting created with ID #${newId}`,
      };
    }

    // UPDATE EXISTING
    const workTypeIds =
      lastRow > 1
        ? ws
            .getRange(2, 1, lastRow - 1, 1)
            .getDisplayValues() // returns "String"
            .flat()
        : [];

    const matchingIndex = workTypeIds.indexOf(String(id));

    // The above returns -1 to account for a case where no matching id exists
    if (matchingIndex === -1) {
      throw new Error(`Work type ID ${id} not found.`);
    }

    // The two of the above cases are checked ok, then the matching id's row will be updated
    const rowToUpdate = matchingIndex + 2;

    //  Update except for 'created_at' at Col5. To do so, updates separately
    // Ensure to use .setValues(), not .setValue()
    ws.getRange(rowToUpdate, 2, 1, 3).setValues([
      [trimmedWorkType, trimmedOptionName, formattedOptionValue],
    ]);
    ws.getRange(rowToUpdate, 6).setValue(now);

    return {
      success: true,
      action: "update_work_type",
      message: `ID #${id} has been updated.`,
    };
  });
}

// ─── READ: getWorkTypeSettings ─────────────────────────────────────────────────────────────
/**
 * Retrieves work type settings as an array of objects.
 * @return {Array<Object>} List of work type objects.
 */
function getWorkTypeSettings() {
  return withSpreadsheet_("getWorkTypeSettings", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.WORK_TYPE);
    const fullRows = ws.getDataRange().getDisplayValues();
    const [headers, ...rows] = fullRows;

    const workTypes = rows.map((row) => {
      const workType = {};
      headers.forEach((field, i) => {
        workType[field] = row[i];
      });
      return workType;
    });

    return workTypes;
  });
}

// ─── DELETE: deleteWorkTypeSetting ─────────────────────────────────────────────────────────────
/**
 * Deletes a row by ID and returns a status object.
 * @param {string} id - The ID to search for in Column A.
 * @return {Object} Result of the operation.
 */
function deleteWorkTypeSetting(id) {
  return withScriptLock_("deleteWorkTypeSetting", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.WORK_TYPE);
    const lastRow = ws.getLastRow();

    // IF only header or less
    if (lastRow < 2) {
      return {
        success: false,
        action: "delete_work_type",
        message: "Sheet is empty or only contains headers.",
      };
    }

    const workTypeIds = ws
      .getRange(2, 1, lastRow - 1, 1)
      .getDisplayValues()
      .flat();

    const matchingIndex = workTypeIds.indexOf(id);

    if (matchingIndex !== -1) {
      const rowNumberToDelete = matchingIndex + 2;
      ws.deleteRow(rowNumberToDelete);

      return {
        success: true,
        action: "delete_work_type",
        message: `Deleted ID #${id} at row ${rowNumberToDelete}.`,
      };
    }

    return {
      success: false,
      action: "delete_work_type",
      message: `ID #${id} was not found in the spreadsheet.`,
    };
  });
}

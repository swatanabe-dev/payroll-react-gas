// ─── CREATE & UPDATE: saveTranspAllowanceSetting ─────────────────────────────────────────────────────────────
/**
 * Saves (CREATES and UPDATES) a new/existing transportation allowance setting
 * Not separated to accommodate a form with flexible/dynamic input fields
 *
 * @param {string}id - The ID to search for in Col A
 * @param {string\number} amount
 * @returns
 */
function saveTranspAllowanceSetting({ transpAllowId: id, amount }) {
  return withScriptLock_("saveTranspAllowanceSetting", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.TRANSPORTATION);
    const lastRow = ws.getLastRow();
    const now = new Date().toISOString();

    const formattedAmount = Number(amount);

    if (isNaN(formattedAmount)) {
      throw new Error(
        "Invalid input - amount: Ensure all fields are filled correctly.",
      );
    }

    // CREATE NEW
    if (!id || id === "") {
      const newId = Utilities.getUuid();

      ws.appendRow([newId, amount, now, now]); // col C (created_at), col D (updated_at)

      return {
        success: true,
        action: "created",
        message: `New setting saved with ID #${newId}`,
      };
    }

    // UPDATEs EXISTING
    const transpAllowIds =
      lastRow > 1
        ? ws
            .getRange(2, 1, lastRow - 1, 1)
            .getDisplayValues()
            .flat()
        : [];

    const matchingIndex = transpAllowIds.indexOf(id);

    // The above returns -1 to account for a case where no matching id exists
    if (matchingIndex === -1) {
      throw new Error(`Work type ID ${id} not found.`);
    }

    const rowToUpdate = matchingIndex + 2;

    // Updates separately, make sure to ues .setValue(), not .setValues()
    ws.getRange(rowToUpdate, 2).setValue(formattedAmount); //  Updates except for 'created_at' at Col C (col 3).
    ws.getRange(rowToUpdate, 4).setValue(now); // Updates 'updated_at' at Col D (col 4)

    return {
      success: true,
      action: "updated",
      message: `ID #${id} has been updated.`,
    };
  });
}

// Read transportation allowance settings
/**
 * Retrieves meal deductible settings as an array of objects.
 * @return {Array<Object>} List of meal deductible objects.
 */
function getTranspAllowanceSettings() {
  return withSpreadsheet_("getTranspAllowanceSettings", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.TRANSPORTATION);
    const data = ws.getDataRange().getDisplayValues();

    const [headers, ...rows] = data;

    const transpAllowanceSettings = rows.map((row) => {
      const transpAllowance = {};
      headers.forEach((field, index) => {
        transpAllowance[field] = row[index];
      });
      return transpAllowance;
    });

    return transpAllowanceSettings;
  });
}

// Delete a matching row
/**
 * Deletes a row by ID and returns a status object.
 * @param {string} id - The ID to search for in Column A.
 * @return {Object} Result of the operation.
 */
function deleteTranspAllowanceSetting(id) {
  return withScriptLock_("deleteTranspAllowanceSetting", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.TRANSPORTATION);
    const lastRow = ws.getLastRow();

    // Handle empty sheets (a case where only header or less)
    if (lastRow < 2) {
      return {
        success: false,
        message: "Sheet is empty or only contains headers",

        action: "none",
      };
    }
    const transpAllowIds = ws
      .getRange(2, 1, lastRow - 1, 1)
      .getDisplayValues()
      .flat();

    const matchingIndex = transpAllowIds.indexOf(id);

    if (matchingIndex !== -1) {
      const rowNumberToDelete = matchingIndex + 2;
      ws.deleteRow(rowNumberToDelete);

      return {
        success: true,
        action: "deleted",
        message: `Deleted ID #${id} at row ${rowNumberToDelete}.`,
      };
    }

    return {
      success: false,
      action: "none",
      message: `ID #${id} was not found in the spreadsheet.`,
    };
  });
}

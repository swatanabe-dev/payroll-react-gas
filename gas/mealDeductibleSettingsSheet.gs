//FUTURE ACTION PLAN: "IF" performance becomes an issue in the future, refactor all functions here,
// as they are still using .getDisplayValues(), which said to be less performant

// CREATE & UPDATE
/**
 * Saves (CREATES and UPDATES) a new/existing meal deductible setting
 * @param {string}id - The ID to search for in Col A
 * @param {string\number} amount - Type-casted when stored in the sheet
 * @returns
 */
function saveMealDeductibleSetting({ mealDeductibleId: id, amount }) {
  return withScriptLock_("saveMealDeductibleSetting", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.MEAL);
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

      ws.appendRow([newId, amount, now, now]); // col A, col B, col C (created_at), col D (updated_at)

      return {
        success: true,
        action: "created",
        message: `New setting saved with ID #${newId}`,
      };
    }

    // UPDATE EXISTING
    const mealDeductibleIds =
      lastRow > 1
        ? ws
            .getRange(2, 1, lastRow - 1, 1)
            .getDisplayValues()
            .flat()
        : [];
    const matchingIndex = mealDeductibleIds.indexOf(String(id));

    // The above returns -1 to account for a case where no matching id exists
    if (matchingIndex === -1) {
      throw new Error(`Work type ID ${id} not found.`);
    }

    const rowToUpdate = matchingIndex + 2;

    //  Updates separately, make sure to ues .setValue(), not .setValues() here
    ws.getRange(rowToUpdate, 2).setValue(formattedAmount); //  Updates except for 'created_at' at Col C.
    ws.getRange(rowToUpdate, 4).setValue(now); // Updates 'updated_at' at Col D

    return {
      success: true,
      action: "updated",
      message: `ID #${id} has been updated.`,
    };
  });
}

// READ
/**
 * Reads meal deductible settings as an array of objects.
 * @return {Array<Object>} List of meal deductible objects.
 */
function getMealDeductibleSettings() {
  return withSpreadsheet_("getMealDeductibleSettings", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.MEAL);

    const data = ws.getDataRange().getDisplayValues();

    const [headers, ...rows] = data;

    const mealDeductibles = rows.map((row) => {
      const mealDeductible = {};
      headers.forEach((field, i) => {
        mealDeductible[field] = row[i];
      });
      return mealDeductible;
    });

    return mealDeductibles;
  });
}

// DELETE
/**
 * Deletes a row by ID and returns a status object.
 * @param {string} id - The ID to search for in Column A.
 * @return {Object} Result of the operation.
 */
function deleteMealDeductibleSetting(id) {
  return withScriptLock_("deleteMealDeductibleSetting", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.MEAL);
    const lastRow = ws.getLastRow();

    // Handle empty sheets (only header or less)
    if (lastRow < 2) {
      return {
        success: false,
        message: "Sheet is empty or only contains headers.",
        action: "none",
      };
    }

    const mealDeductibleIds = ws
      .getRange(2, 1, lastRow - 1, 1)
      .getDisplayValues()
      .flat();

    const matchingIndex = mealDeductibleIds.indexOf(id);

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

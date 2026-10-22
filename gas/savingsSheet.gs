// FUTURE ACTION PLAN: Refactor all functions, "IF" performance becomes an issue. Still using slow GAS functions

// Create a tx record
function addSavingsTransaction({
  userId,
  transactionDate,
  transactionType,
  amount,
  note,
}) {
  return withScriptLock_("addSavingsTransaction", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.SAVINGS);

    const savingsId = Utilities.getUuid();
    const created_at = new Date().toISOString();
    const trimmedNote = note?.trim() || "";
    ws.appendRow([
      savingsId,
      userId,
      transactionDate,
      transactionType,
      amount,
      trimmedNote,
      created_at,
    ]);

    return true;
  });
}

// Read tx records
function getUserSavings(userId) {
  return withSpreadsheet_("getUserSavings", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.SAVINGS);
    const lastRow = ws.getLastRow();

    if (lastRow < 2) return [];

    const fullTable = ws
      .getRange(1, 1, lastRow, ws.getLastColumn())
      .getDisplayValues();

    const [headers, ...rows] = fullTable;

    const filteredRows = rows.filter((row) => row[1] === userId);

    return filteredRows.map((row) => {
      return headers.reduce((dataObj, header, i) => {
        dataObj[header] = row[i];
        return dataObj;
      }, {});
    });
  });
}

// ─── updateSavings ─────────────────────────────────────────────────────────────
/**
 *
 * @param param0
 * @returns
 */

function updateSavings({
  savingsId,
  userId,
  transactionDate,
  transactionType,
  amount,
  note,
}) {
  return withScriptLock_("update_user_savings", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.SAVINGS);
    const dataRows = ws.getDataRange().getValues();

    if (dataRows.length < 2) {
      throw new Error("Sheet is empty or only contains headers.");
    }

    const headers = dataRows.shift();

    const rowIndex = dataRows.findIndex(
      (row) => String(row[0]) === String(savingsId),
    );

    // Note: findIndex returns -1 if not found a match
    if (rowIndex === -1) {
      throw new Error(`Savings Tx ID ${savingsId} not found.`);
    }

    const rowToUpdate = rowIndex + 2;

    const now = new Date().toISOString();
    const originalCreatedAt = dataRows[rowIndex][6]; // col G

    const trimmedUserId = String(userId || "").trim();
    const trimmedDate = String(transactionDate || "").trim();
    const trimmedType = String(transactionType || "").trim();
    const formattedAmount = Number(amount || 0);
    const trimmedNote = String(note || "").trim();

    // Validation Check
    if (
      !trimmedUserId ||
      !trimmedDate ||
      !trimmedType ||
      isNaN(formattedAmount) ||
      !trimmedNote
    ) {
      throw new Error(
        "Invalid input: Ensure all required fields are filled correctly.",
      );
    }

    // Prepare data for update
    const updatedRowSlice = [
      trimmedUserId,
      trimmedDate,
      trimmedType,
      formattedAmount,
      trimmedNote,
      originalCreatedAt,
      now,
    ];

    ws.getRange(rowToUpdate, 2, 1, 7).setValues([updatedRowSlice]);
  });
}

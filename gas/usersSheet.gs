// ─── CREATE: addUser ─────────────────────────────────────────────────────────────
/**
 * Creates a new user profile in the system.
 *
 * @param {Object} userObj - The user creation details.
 * @param {string} userObj.firstName - The user's first name.
 * @param {string} userObj.lastName - The user's last name.
 * @param {string} userObj.dob - The user's date of birth ('react-hook-form returns "YYYY-MM-DD" string').
 * @param {number} userObj.userFee - The registration or subscription fee in JPY.
 * @param {'Deposit'|'Cash'} userObj.paymentMethod - The user's preferred payment method.
 * @param {string} - The date the user joined ('react-hook-form returns "YYYY-MM-DD" string').
 * @param {string} [userObj.memo] - An optional internal note or comment about the user.
 * @returns {Promise<any>} The newly created user ID
 *
 * @example
 * const user = await addUser({
 *   firstName: 'Jane',
 *   lastName: 'Doe',
 *   dob: '1990-04-15',
 *   userFee: 29,
 *   paymentMethod: 'Deposit',
 *   dateJoined: '2022-08-08',
 *   memo: 'Referred by an existing user',
 * });
 */
function addUser({
  firstName,
  lastName,
  dob,
  userFee,
  paymentMethod,
  dateJoined,
  memo,
}) {
  return withScriptLock_("addUser", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.USERS);

    // Sanitize
    const trimmedFirstName = String(firstName || "").trim();
    const trimmedLastName = String(lastName || "").trim();
    const trimmedDob = String(dob || "").trim();
    const formattedUserFee = Number(userFee || 0);
    const trimmedPaymentMethod = String(paymentMethod || "").trim();
    const trimmedDateJoined = String(dateJoined || "").trim();
    const trimmedMemo = String(memo || "").trim();

    // Validate
    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedDob ||
      isNaN(formattedUserFee) ||
      !trimmedPaymentMethod ||
      !trimmedDateJoined
      // !trimmedMemo
    ) {
      throw new Error(
        "Invalid input: Ensure all 'users' fields are filled correctly.",
      );
    }

    const userId = Utilities.getUuid();
    const dateLeft = "";
    const now = new Date().toISOString();

    ws.appendRow([
      userId,
      trimmedFirstName,
      trimmedLastName,
      trimmedDob,
      formattedUserFee,
      trimmedPaymentMethod,
      trimmedDateJoined,
      dateLeft,
      trimmedMemo,
      now,
      now,
    ]);

    return userId;
  });
}

// ─── READ: getUsers "PUBLIC API ENDPOINT" - REFACTORED ─────────────────────────────────────────────────────────────
/**
 * Returns all users from the Users sheet as an array of objects,
 * keyed by the header row. Date fields are formatted "yyyy-mm-dd"
 *
 * Called directly by Vite frontend via google.script.run.getUsers()
 *
 * @returns {Object[]} Array of user objects, or an empty array if no data exists.
 * @throws {Error} If the Users sheet cannot be found by its ID.
 */
function getUsers() {
  return withSpreadsheet_("getUsers", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.USERS);

    if (!ws) throw new Error(`Sheet not found: ID "${SHEET_IDS.USERS}"`);

    const data = ws.getDataRange().getValues();
    // NOTE: .getValues() returns [[""]] when the sheet is empty. In JS, [[""]}.length is 1
    if (data.length < 2 && data[0][0] === "") return [];

    // .shift would be a bit faster and MORE MEMORY EFFICIENT. Change "IF" the performance is concerned
    const [headers, ...rows] = data;

    return rows.map((row) => {
      const user = {};

      headers.forEach((header, i) => {
        let value = row[i];

        if (value instanceof Date) {
          if (
            header === "dob" ||
            header === "dateJoined" ||
            header ||
            "dateLeft"
          ) {
            // Manually format DOB to isolate local dates and fix the timezone shift
            const rowYear = value.getFullYear();
            const rowMonth = String(value.getMonth() + 1).padStart(2, "0");
            const rowDate = String(value.getDate()).padStart(2, "0");
            value = `${rowYear}-${rowMonth}-${rowDate}`;
          } else {
            // Keep using a helper for all other date fields
            value = toISODateString_(value);
          }
        }

        user[header] = value;
      });

      return user;
    });
  });
}

// ─── READ: getUsers_ "PRIVATE/INTERNAL CALL" ─────────────────────────────────────────────────────────────
/**
 * Returns all users from the Users sheet as an array of objects,
 * keyed by the header row. Date fields are formatted "yyyy-MM-dd"
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} gs
 * @returns {Array<Object>} array of archive records
 */
function getUsers_(gs) {
  const ws = gs.getSheetById(SHEET_IDS.USERS);
  if (!ws) throw new Error(`Sheet not found: ID "${SHEET_IDS.USERS}"`);

  const data = ws.getDataRange().getValues();
  // NOTE: .getValues() returns [[""]] when the sheet is empty. In JS, [[""]}.length is 1
  if (data.length < 2 && data[0][0] === "") return [];

  const [headers, ...rows] = data;

  return rows.map((row) => {
    const user = {};

    headers.forEach((header, i) => {
      let value = row[i];

      if (value instanceof Date) {
        if (
          header === "dob" ||
          header === "dateJoined" ||
          header ||
          "dateLeft"
        ) {
          // Manually format DOB to isolate local dates and fix the timezone shift
          const rowYear = value.getFullYear();
          const rowMonth = String(value.getMonth() + 1).padStart(2, "0");
          const rowDate = String(value.getDate()).padStart(2, "0");
          value = `${rowYear}-${rowMonth}-${rowDate}`;
        } else {
          // Keep using a helper for all other date fields
          value = toISODateString_(value);
        }
      }

      user[header] = value;
    });

    return user;
  });
}

// ─── READ: getUserDetails (PUBLIC) REFACTORED ─────────────────────────────────────────────────────────────
function getUserDetails(userId) {
  return withSpreadsheet_("getUserDetails", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.USERS);
    const data = ws.getDataRange().getValues();

    if (data.length <= 1) return null;

    // Cleaning headers
    const headers = data.shift().map((header) => header?.toString().trim());

    const userIdIndex = headers.indexOf("userId");
    if (userIdIndex === -1) return null;

    const targetId = String(userId).trim();

    const selectedUser = data.find(
      (row) => String(row[userIdIndex]).trim() === targetId,
    );

    if (!selectedUser) return null;

    const user = {};

    headers.forEach((header, i) => {
      if (!header) return;
      let value = selectedUser[i];

      if (value instanceof Date) {
        if (["dob", "dateJoined", "dateLeft"].includes(header)) {
          const rowYear = value.getFullYear();
          const rowMonth = String(value.getMonth() + 1).padStart(2, "0");
          const rowDate = String(value.getDate()).padStart(2, "0");
          value = `${rowYear}-${rowMonth}-${rowDate}`;
        } else {
          value = toISODateString_(value);
        }
      }
      user[header] = value;
    });

    return user;
  });
}

// ─── READ: getUsersForDropdown (PUBLIC) REFACTORED ─────────────────────────────────────────────────────────────
// Read #3: For the WorkLogForm dropdown
/**
 * Reads all users' NAMES for the WorkLogForm dropdown
 *
 * @returns {Array}
 */
function getUsersForDropdown() {
  return withSpreadsheet_("getUsersForDropdown", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.USERS);
    const data = ws.getDataRange().getValues();
    if (data.length < 2) return null;

    const headers = data[0];
    const userId = headers.indexOf("userId");
    const firstNameIdx = headers.indexOf("firstName");
    const lastNameIdx = headers.indexOf("lastName");

    if (userId === -1 || firstNameIdx === -1 || lastNameIdx === -1) return null;

    const users = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (!row[userId]) continue;

      users.push({
        userId: row[userId],
        firstName: row[firstNameIdx],
        lastName: row[lastNameIdx],
      });
    }

    return users;
  });
}

// ─── UPDATE: updateUser (PUBLIC) ─────────────────────────────────────────────────────────────
/**
 * Updates an existing user profile in the spreadsheet by UUID.
 *
 * @param {Object} userObj - The user update details
 * @param {string} userObj.userId - The unique ID of the user to update
 * @param {string} userObj.firstName - The user's first name
 * @param {string} userObj.lastName - The user's last name
 * @param {string} userObj.dob - The user's date of birth ('YYYY-MM-DD')
 * @param {number} userObj.userFee - The registration or subscription fee in JPY
 * @param {'Deposit'|'Cash'} userObj.paymentMethod - The user's preferred payment method
 * @param {string} userObj.dateJoined - The date the user joined ('YYYY-MM-DD')
 * @param {string} [userObj.dateLeft] - An optional date when the user left ('YYYY-MM-DD')
 * @param {string} [userObj.memo] - An optional internal note or comment
 * @returns {boolean} Returns `true` if the update succeeded
 * @throws {Error} If required inputs are missing/invalid or the user USERID is not found
 *
 * @example
 * updateUser({
 *   userId: '123e4567-e89b-12d3-a456-426614174000',
 *   firstName: 'Jane',
 *   lastName: 'Doe',
 *   dob: '1990-04-15',
 *   userFee: 29,
 *   paymentMethod: 'Deposit',
 *   dateJoined: '2022-08-08',
 *   dateLeft: '',
 *   memo: 'Updated payment method',
 * });
 */
function updateUser({
  userId,
  firstName,
  lastName,
  dob,
  userFee,
  paymentMethod,
  dateJoined,
  dateLeft,
  memo,
}) {
  return withScriptLock_("updateUser", (gs) => {
    const trimmedUserId = String(userId || "").trim();
    const trimmedFirstName = String(firstName || "").trim();
    const trimmedLastName = String(lastName || "").trim();
    const trimmedDob = String(dob || "").trim();
    const formattedUserFee = Number(userFee || 0);
    const trimmedPaymentMethod = String(paymentMethod || "").trim();
    const trimmedDateJoined = String(dateJoined || "").trim();
    const trimmedDateLeft = String(dateLeft || "").trim();
    const trimmedMemo = String(memo || "").trim();

    if (
      !trimmedUserId ||
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedDob ||
      isNaN(formattedUserFee) ||
      !trimmedPaymentMethod ||
      !trimmedDateJoined
    ) {
      throw new Error(
        "Invalid input: Ensure UUID, Name, DOB, Fee, Payment Method, and Date Joined are filled correctly.",
      );
    }

    const ws = gs.getSheetById(SHEET_IDS.USERS);
    const data = ws.getDataRange().getValues();

    if (data.length < 2) {
      throw new Error("Sheet is empty or only contains headers.");
    }
    const now = new Date().toISOString();

    // Consider .shift()
    const headers = data[0];
    const rows = data.slice(1);

    // In-memory array search for the userId
    const rowIndex = rows.findIndex((row) => String(row[0]) === trimmedUserId);

    // Note: findIndex returns -1 if not found a match
    if (rowIndex === -1) {
      throw new Error(`User ID ${trimmedUserId} not found.`);
    }

    const rowToUpdate = rowIndex + 2;
    const createdAt = rows[rowIndex][9]; // Column 10 is index 9

    const updatedRowSlice = [
      trimmedFirstName, // Col 2
      trimmedLastName,
      trimmedDob,
      formattedUserFee,
      trimmedPaymentMethod,
      trimmedDateJoined,
      trimmedDateLeft,
      trimmedMemo,
      createdAt,
      now, // Col 11 (UpdatedAt)
    ];

    // ws.getRange(row, column, numRows, numColumns)
    ws.getRange(rowToUpdate, 2, 1, 10).setValues([updatedRowSlice]);

    return {
      success: true,
      action: "updateUser",
      message: `User ${trimmedFirstName} ${trimmedLastName} updated successfully.`,
    };
  });
}

// ─── DELETE: deleteUser (PUBLIC) ─────────────────────────────────────────────────────────────
/**
 *
 * @param {string} userId
 * @returns
 */
function deleteUser(userId) {
  return withScriptLock_("deleteUser", (gs) => {
    const ws = gs.getSheetById(SHEET_IDS.USERS);
    const lastRow = ws.getLastRow();
    const userIds = ws
      .getRange(2, 1, lastRow - 1, 1)
      .getValues()
      .flat();
    const idArrayIndex = userIds.indexOf(userId);
    const sheetRowNumber = idArrayIndex === -1 ? 0 : idArrayIndex + 2;

    ws.deleteRow(sheetRowNumber);

    return true;
  });
}

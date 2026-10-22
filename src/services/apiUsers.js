import { serverFunctions } from "./gasClient";

// ─── CREATE: addUser ─────────────────────────────────────────────────────────────
/**
 * Sends a request to the server to create a new user profile.
 *
 * @param {Object} params - The user creation details.
 * @param {string} params.firstName - The user's first name.
 * @param {string} params.lastName - The user's last name.
 * @param {string} params.dob - The user's date of birth (expected as "YYYY-MM-DD". NOTE: UNIQUE TO REACT HOOK FORM DATE FORMAT).
 * @param {number} params.userFee - The registration or subscription fee.
 * @param {'Deposit'|'Cash'} params.paymentMethod - The user's preferred payment method.
 * @param {string} params.dateJoined - The date the user joined (expected as "YYYY-MM-DD").
 * @param {string} [params.memo] - An optional internal note or comment about the user.
 * @returns {Promise<any>} A promise that resolves to the data returned by the server (e.g., the new user's UUID).
 * @throws {Error} Throws an error if the server request fails and the user cannot be added.
 */
export async function addUser({
  firstName,
  lastName,
  dob,
  userFee,
  paymentMethod,
  dateJoined,
  memo,
}) {
  try {
    const data = await serverFunctions.addUser({
      firstName,
      lastName,
      dob,
      userFee,
      paymentMethod,
      dateJoined,
      memo,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("New user could not be added.");
  }
}

// ─── READ: getUsers ─────────────────────────────────────────────────────────────
// Read #1: All users
export async function getUsers() {
  try {
    const data = await serverFunctions.getUsers();

    return data;
  } catch (error) {
    console.error("Error - apiUsers/getUsers: ", error);
    throw new Error("Users data could not be fetched from google sheet.");
  }
}
// ─── READ: getUserDetails ─────────────────────────────────────────────────────────────
// Read #2: An individual data
export async function getUserDetails(userId) {
  try {
    const data = await serverFunctions.getUserDetails(userId);

    return data;
  } catch (error) {
    console.error("Error occurred - apiUsers - getUserDetails", error);
    throw new Error(
      "There's been an error fetching user data from google sheet 'Users'.",
    );
  }
}

// ─── READ: getUsersForDropdown ─────────────────────────────────────────────────────────
// Read #3: For the WorkLogForm dropdown
export async function getUsersForDropdown() {
  try {
    const data = await serverFunctions.getUsersForDropdown();

    return data;
  } catch (error) {
    console.error("Error occurred @ apiUsers - getUsersForDropdown:", error);
    throw new Error(
      "There's been an error fetching user names for dropdown lists.",
    );
  }
}

// ─── UPDATE: updateUser ─────────────────────────────────────────────────────────────
export async function updateUser({
  uuid,
  firstName,
  lastName,
  dob,
  userFee,
  paymentMethod,
  dateJoined,
  dateLeft,
  memo,
}) {
  try {
    await serverFunctions.updateUser({
      uuid,
      firstName,
      lastName,
      dob,
      userFee,
      paymentMethod,
      dateJoined,
      dateLeft,
      memo,
    });

    return true;
  } catch (error) {
    console.error(error);
    throw new Error("User info could not be updated:(.");
  }
}

export async function deleteUser(uuid) {
  try {
    await serverFunctions.deleteUser(uuid);
    return true;
  } catch (error) {
    console.error(error);
    throw new Error("User could not be deleted.");
  }
}

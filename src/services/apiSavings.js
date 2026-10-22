import { serverFunctions } from "./gasClient";

// Create a new transaction entry
export async function addSavingsTransaction({
  userId,
  transactionDate,
  transactionType,
  amount,
  note,
}) {
  try {
    const data = await serverFunctions.addSavingsTransaction({
      userId,
      transactionDate,
      transactionType,
      amount,
      note,
    });
    return data;
  } catch (error) {
    console.error("@apiSaving - addSaving:", error);
    throw new Error("New savings transaction could not be added.");
  }
}

// Read user specific savings data
export async function getUserSavings(userId) {
  try {
    const data = await serverFunctions.getUserSavings(userId);

    return data;
  } catch (error) {
    console.error("Error occurred @ apiSaving - getUserSaving:", error);
    throw new Error(
      "An error occurred while fetching data from google sheet 'savings',",
    );
  }
}

// Update a transaction
export async function updateSavings(payload) {
  try {
    await serverFunctions.updateSavings(payload);
    return true;
  } catch (error) {
    console.error("API Error @updateSavings: ", error);
    throw new Error("Update filed.");
  }
}

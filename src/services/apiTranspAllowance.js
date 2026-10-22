import { serverFunctions } from "./gasClient";

// POST and PATCH
// Create a new data OR update an existing data
export async function saveTranspAllowanceSetting({ transpAllowId, amount }) {
  try {
    const data = await serverFunctions.saveTranspAllowanceSetting({
      transpAllowId,
      amount,
    });

    return data;
  } catch (error) {
    console.error("@saveTranspAllowSetting, apiTranspAllowance", error);
    throw new Error("Transportation allowance setting could not be added.");
  }
}

// GET
// Read the table data
export async function getTranspAllowanceSettings() {
  try {
    const data = await serverFunctions.getTranspAllowanceSettings();
    return data;
  } catch (error) {
    console.error("getTranspAllowanceSettings API Error: ", error);
    throw new Error(
      "Couldn't get transportation allowance settings from the sheet.",
    );
  }
}

// DELETE
// Delete a data row
export async function deleteTranspAllowanceSetting(id) {
  try {
    await serverFunctions.deleteTranspAllowanceSetting(id);
    return true;
  } catch (error) {
    console.error("Error @deleteTransp API", error);
    throw new Error("Transportation setting could not be deleted.");
  }
}

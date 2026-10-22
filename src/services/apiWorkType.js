import { serverFunctions } from "./gasClient";

// POST
// Create a new data
export async function saveWorkTypeSetting({
  workTypeId,
  workType,
  optionName,
  optionValue,
}) {
  try {
    const data = await serverFunctions.saveWorkTypeSetting({
      workTypeId,
      workType,
      optionName,
      optionValue,
    });

    return data;
  } catch (error) {
    console.error("@ saveWorkTypeSetting, apiWorkType", error);
    throw new Error("Work type setting could not be added/updated.");
  }
}

// GET
// Read a data table
export async function getWorkTypeSettings() {
  try {
    const data = await serverFunctions.getWorkTypeSettings();

    return data;
  } catch (error) {
    console.error("getWorkTypeSettings API Error: ", error);
    throw new Error("Couldn't get work type settings from google sheet.");
  }
}

// DELETE
// Delete a data row
export async function deleteWorkTypeSetting(id) {
  try {
    await serverFunctions.deleteWorkTypeSetting(id);
    return true;
  } catch (error) {
    console.error(error);
    throw new Error("Work type setting could not be deleted.");
  }
}

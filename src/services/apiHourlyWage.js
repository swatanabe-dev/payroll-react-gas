import { serverFunctions } from "./gasClient";

// GET
// Read a data table
export async function getHourlyWageSettings() {
  try {
    const data = await serverFunctions.getHourlyWageSettings();

    return data;
  } catch (error) {
    console.error("getHourlyWageSettings API Error: ", error);
    throw new Error("Couldn't get hourly wage settings from google sheet.");
  }
}

// POST
// Create a new data or update an existing
export async function saveHourlyWageSetting({
  hourlyWageId,
  workType,
  hourlyWage,
}) {
  try {
    const data = await serverFunctions.saveHourlyWageSetting({
      hourlyWageId,
      workType,
      hourlyWage,
    });
    return data;
  } catch (error) {
    console.error("@saveHourlyWageSetting, apiHourlyWage: ", error);
    throw new Error("Hourly wage setting could not be added/updated.");
  }
}

// DELETE
// Delete a data row
export async function deleteHourlyWageSetting(id) {
  try {
    await serverFunctions.deleteHourlyWageSetting(id);
    return true;
  } catch (error) {
    console.error("deleteHourlyWageSetting API Error: ", error);
    throw new Error(`Hourly wage setting #${id} could not be deleted.`);
  }
}

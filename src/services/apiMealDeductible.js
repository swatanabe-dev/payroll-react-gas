import { serverFunctions } from "./gasClient";

// POST and PATCH
// Create a new data OR update an existing data
export async function saveMealDeductibleSetting({ mealDeductibleId, amount }) {
  try {
    const data = await serverFunctions.saveMealDeductibleSetting({
      mealDeductibleId,
      amount,
    });

    return data;
  } catch (error) {
    console.error("@saveMealDeductibleSetting, apiMealDeductible", error);
    throw new Error("Meal deductible setting could not be added.");
  }
}

// GET
// Read the table data
export async function getMealDeductibleSettings() {
  try {
    const data = await serverFunctions.getMealDeductibleSettings();
    return data;
  } catch (error) {
    console.error("@getMealDeductibleSettings API Error: ", error);
    throw new Error("Could't get meal deductible settings form the sheet.");
  }
}

// DELETE
// Delete a data row
export async function deleteMealDeductibleSetting(id) {
  try {
    await serverFunctions.deleteMealDeductibleSetting(id);
    return true;
  } catch (error) {
    console.error("@deleteMealDeductibleSetting, API Error: ", error);
    throw new Error("Meal deductible setting could not be deleted.");
  }
}

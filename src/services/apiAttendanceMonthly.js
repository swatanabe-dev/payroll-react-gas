import { serverFunctions } from "./gasClient";

// ─── getMonthlyPrizeData ─────────────────────────────────────────────────────────────
export async function getMonthlyPrizeData(criteria = {}) {
  const { fiscalYear: targetYear, month: targetMonth } = criteria;

  try {
    const prizeRecords = await serverFunctions.getMonthlyPrizeData(
      targetYear,
      targetMonth,
    );

    return prizeRecords;
  } catch (error) {
    console.error("Error - @API - getMonthlyPrizeData", error);
    throw new Error(`Monthly prize data for the period could not be retrieved`);
  }
}

import { serverFunctions } from "./gasClient";

// ─── getAvailablePayslipPeriods API ─────────────────────────────────────────────────────────────
// Get a unique set of year-month from `payslips` sheet for dropdown
export async function getAvailablePayslipPeriods() {
  try {
    const data = await serverFunctions.getAvailablePayslipPeriods();

    return data;
  } catch (error) {
    console.error("@getAvailablePayslipPeriods - API:", error);
    throw new Error(
      "Failed to get available payslip data periods from Google Sheet.",
    );
  }
}

// ─── getPayslipsForPeriod ─────────────────────────────────────────────────────────────
export async function getPayslipsForPeriod({ year, month }) {
  try {
    const data = await serverFunctions.getPayslipsForPeriod(year, month);
    return data;
  } catch (error) {
    console.error("@getPayslipsForPeriod - API:", error);
    throw new Error(
      "Failed to get available payslips for the selected period from Google Sheet.",
    );
  }
}

// ─── processMultiplePayslips API ─────────────────────────────────────────────────────────────
export async function processMultiplePayslips(processingCriteria = {}) {
  const { userIds, year, month } = processingCriteria;

  try {
    const payslipData = await serverFunctions.processMultiplePayslips(
      userIds,
      year,
      month,
    );

    return payslipData;
  } catch (error) {
    console.error("Error - @api - processMultiplePayslips", error);
    throw new Error(
      `Payslips for these selected users could not be retrieved `,
    );
  }
}

// ─── getPrizeWinnersForPeriod ─────────────────────────────────────────────────────────────
export async function getPrizeWinnersForPeriod(criteria = {}) {
  const { fiscalYear: year, month } = criteria;
  try {
    const winners = await serverFunctions.getPrizeWinnersForPeriod(year, month);

    return winners;
  } catch (error) {
    console.error("Error - @API - getPrizeWinnersForPeriod", error);
    throw new Error(`Prize winners for the period could not be retrieved`);
  }
}

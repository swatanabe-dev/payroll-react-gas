import { serverFunctions } from "./gasClient";
import { LOGS_PER_PAGE } from "../utils/constants";

// Get paginated logs
export async function getPaginatedWorkLogs(page, category, searchWord) {
  try {
    const from = (page - 1) * LOGS_PER_PAGE;
    const to = from + LOGS_PER_PAGE - 1;

    const data = await serverFunctions.getPaginatedWorkLogs(
      from,
      to,
      category,
      searchWord,
    );

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Couldn't get paginated work logs from the sheet.");
  }
}

// Get user logs for a specified period
// For WorkWorStatus.jsx
export async function getUserWorklogsForPeriod(criteria = {}) {
  const { userId, year, month } = criteria;
  try {
    const userWorklogs = await serverFunctions.getUserWorklogsForPeriod(
      userId,
      year,
      month,
    );

    return userWorklogs;
  } catch (error) {
    console.error("Error @apiWorkLogs - getUserWorklogsForPeriod", error);
    throw new Error(
      "Failed fetching a user worklogs for a period from google sheet 'workLogs'.",
    );
  }
}

// Get unarchived fiscal year - Only for the Archives page
export async function getUnarchivedFiscalYears() {
  try {
    const data = await serverFunctions.getUnarchivedFiscalYears();

    return data;
  } catch (error) {
    console.error("API Error @getUnarchivedFiscalYears: ", error);
    throw new Error("Failed to get unarchived years data.");
  }
}

// Add a log
export async function addWorkLog(payload) {
  try {
    const data = await serverFunctions.addWorkLog(payload);

    return data;
  } catch (error) {
    console.error("API Error @ addWorkLog:", error);
    throw new Error("Work log could not be added.");
  }
}

// Update a log
export async function updateWorkLog(payload) {
  try {
    await serverFunctions.updateWorkLog(payload);
    return true;
  } catch (error) {
    console.error("API Error @ updateWorkLog:", error);
    throw new Error("Work log could not be updated.");
  }
}

// Delete a log
export async function deleteWorkLog(id) {
  try {
    await serverFunctions.deleteWorkLog(id);
    return true;
  } catch (error) {
    console.error(error);
    throw new Error("Work log could not be deleted.");
  }
}

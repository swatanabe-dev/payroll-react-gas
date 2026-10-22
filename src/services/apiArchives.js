import { serverFunctions } from "./gasClient";

export async function getArchives() {
  try {
    const data = await serverFunctions.getArchives();

    return data;
  } catch (error) {
    console.error("Error - getArchives @apiArchives: ", error);
    throw new Error("Failed to fetch Archives data.");
  }
}

export async function archiveFiscalYear(payload) {
  try {
    const data = await serverFunctions.archiveFiscalYear(payload);
    return data;
  } catch (error) {
    console.error("API Error @archiveFiscalYear:", error);
    throw new Error("Failed to create a copy.");
  }
}

export async function verifyArchive(payload) {
  try {
    const data = await serverFunctions.verifyArchive(payload);
    return data;
  } catch (error) {
    console.error("API Error @verifyArchive:", error);
    throw new Error("Failed to verify a copy.");
  }
}
/**
 * Purge the specified FY data from the app database (google spreadsheets)
 *
 * @param {Object} payload - {archiveId, targetFY, authorizedBy}
 * @returns {Object} - {success, action, message}
 */
export async function purgePrevFyData(payload) {
  try {
    const data = await serverFunctions.purgePrevFyData(payload);

    // Backend error polite object: {success: false, action: actionName, message:"..."}
    if (data && data.success === false) {
      throw new Error(data.message); // Throws it to the catch block below
    }

    return data;
  } catch (error) {
    console.error("API Error @purgePrevFyData:", error);
    // throw new Error("Failed to purge previous FY data.");
    throw error;
  }
}

// ─── withScriptLock ─────────────────────────────────────────────────────────────
/**
 * A centralized wrapper to execute Google Sheets operations safely with a lock.
 * @param {string} actionName - The name of the action (for logging/returning).
 * @param {Function} operation - The core logic to execute while locked.
 * @returns {Object} A standard success/failure response object.
 */
function withScriptLock_(actionName, operation, lockDuration = 10000) {
  const lock = LockService.getScriptLock();
  // Fetch the spreadsheet only when the operation runs
  const gs = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // By default, wait up to 10 seconds for the lock
    lock.waitLock(lockDuration);

    // Execute the actual CRUD logic passed into the wrapper
    return operation(gs);
  } catch (error) {
    console.error(`Server-side Error @${actionName}:`, error);

    // Check if the error was a lock timeout
    const isTimeout = error.message.toLowerCase().includes("lock");

    return {
      success: false,
      action: actionName,
      message: isTimeout
        ? "The system is currently busy processing another request. Please try again."
        : error.message,
    };
  } finally {
    // Ensure the lock is released
    lock.releaseLock();
  }
}

/**
 * A centralized wrapper for read-only operations that don't need a lock.
 * @param {string} actionName - The name of the action (for logging).
 * @param {Function} operation - The core logic to execute.
 * @returns {Object} A standard success/failure response object.
 */
function withSpreadsheet_(actionName, operation) {
  try {
    // Fetch the spreadsheet only when the operation runs
    const gs = SpreadsheetApp.getActiveSpreadsheet();

    // Inject 'gs' into the operation
    return operation(gs);
  } catch (error) {
    console.error(`Server-side Error @${actionName}:`, error);

    return {
      success: false,
      action: actionName,
      message: error.message,
    };
  }
}

// ─── Helper functions ─────────────────────────────────────────────────────────────
// General helper functions

/**
 * IMPORTANT FUNCTION - this avoids "date shift" problem
 *
 * Formats a native JS Date object into a 'yyyy-MM-dd' string using native methods.
 * If the input is not a valid Date, it safely returns the value as-is.
 *
 * @param {any} value - The cell value to check and format.
 * @return {string|any} The formatted date string or the original value.
 */
function formatDateNative_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const date = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  }
  return value;
}

/**
 * Gets Fiscal Year from separate year/month values
 */
function getFiscalYear_(year, month) {
  const y = Number(year);
  const m = Number(month);
  if (m < 1 || m > 12) return null;
  return m >= 4 ? y : y - 1;
}

/**
 * Gets Fiscal Year from a Date object or 'yyyy-MM-dd' string
 */
function getFyFromDate_(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  return getFiscalYear_(d.getFullYear(), d.getMonth() + 1);
}

// IMPORTANT: For TIMESTAMP (e.g. created_at, updated_at) ONLY!!!
// as TIME SHIFT issue is not taken into account
/**
 * COULD BE USED FOR TIMESTAMPS LIKE CREATED_AT AND UPDATED_AT
 * BUT BASICALLY AVOID
 *
 * Formats a Data object to an ISO date string (yyyy-MM-dd)
 * React Hook Form date inputs require this format.
 *
 * @param {Date} date
 * @returns {string} e.g. "1982-05-06"
 */
function toISODateString_(date) {
  return date.toISOString().split("T")[0];
}

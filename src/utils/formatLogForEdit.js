/**
 * IN USE. KEEP THIS.
 *
 * Parse "STRING" JSON object worklog
 * @param {Object} log
 * @returns
 */
export function formatLogForEdit(log) {
  // Guard clause if log is null, undefined, or empty
  if (!log || Object.keys(log).length === 0) {
    return { adjustments: [] };
  }

  let parsedAdjustments = [];
  if (log.adjustments) {
    try {
      parsedAdjustments =
        typeof log.adjustments === "string"
          ? JSON.parse(log.adjustments)
          : log.adjustments;
    } catch (error) {
      console.error("Failed to parse adjustments JSON:", error);
      parsedAdjustments = []; // fallback to empty array if corrupt
    }
  }

  return {
    ...log,

    userInfo:
      log.userId && log.name
        ? JSON.stringify({ userId: log.userId, name: log.name })
        : "",

    date: log.date ? log.date.replace(/\//g, "-") : "",

    adjustments: parsedAdjustments,
  };
}

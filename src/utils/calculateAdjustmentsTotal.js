// IN USE. KEEP THIS

import { formatNumber } from "./formatNumber";

/**
 * Parse a string JSON object and calculate total for worklog adjustments
 * @param {string|undefined} adjustmentsData - "adjustments" comes in as a string JSON object
 * @returns {number}
 */
export function calculateAdjustmentsTotal(adjustmentsData) {
  if (!adjustmentsData) return 0;
  try {
    const adjustments = JSON.parse(adjustmentsData);

    if (!Array.isArray(adjustments)) return 0;

    const totalAmount = adjustments.reduce((total, adjustment) => {
      if (adjustment.type === "addition") {
        return total + adjustment.amount;
      }
      if (adjustment.type == "deduction") {
        return total - adjustment.amount;
      }
      return total;
    }, 0);

    return formatNumber(totalAmount);
  } catch (error) {
    console.error("Failed to parse adjustments JSON:", error);
    return 0; // Return 0 if JSON is malformed
  }
}

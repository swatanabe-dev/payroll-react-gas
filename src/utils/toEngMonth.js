import { MONTHS_SHORT, MONTHS_LONG } from "./constants.js";

/**
 * Eng-version app ONLY!! In Japanese, months are almost always expressed as numbers.
 * The original version never thought about an English version of it.
 *
 * Converts a 1-indexed month number to its English abbreviation.
 * @param {number} month - Month number, 1 (jan) through 12 (dec)
 * @returns {string}
 * @throws {RangeError} If month is not an integer between 1 and 12.
 */
export function toEngMonth(month, format = "short") {
  const index = Number(month) - 1;

  if (!Number.isInteger(index) || index < 0 || index > 11) {
    throw new RangeError(`Invalid month: ${month}. Expected an integer 1-12.`);
  }

  switch (format) {
    case "short":
      return MONTHS_SHORT[index];
    case "long":
      return MONTHS_LONG[index];
    default:
      throw new RangeError(
        `Invalid format: "${format}". Expected "short" or "long".`,
      );
  }
}

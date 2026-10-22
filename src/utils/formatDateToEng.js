// THIS IS ONLY FOR Eng Version. Not in the original.
/**
 *
 * @param {"yyyy-MM-dd"} date
 * @returns {"MM/dd/yyyy"}
 */
export function formatDateToEng(date) {
  // Assumes a string date shaped "yyyy-MM-dd"

  if (!date || date.length === 0) return "-";
  const [year, month, day] = date.split("-");

  const formattedDate = `${month}/${day}/${year}`;

  return formattedDate;
}

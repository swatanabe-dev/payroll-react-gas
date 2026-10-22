// IN USE. KEEP
export function formatDateToJp(date) {
  // Assumes a string date shaped "yyyy-MM-dd"

  if (!date || date.length === 0) return "-";
  const [year, month, day] = date.split("-");

  const formattedDate = `${year}年${month}月${day}日`;

  return formattedDate;
}

// ─── SalariesTableSchema helper ─────────────────────────────────────────────────────────────
/**
 * @param{string} strDate
 * @return{string} strDate
 */
export function formatToLocalDate(strDate) {
  if (!strDate) return "-";
  const date = new Date(strDate);
  if (isNaN(date.getTime())) return "-";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

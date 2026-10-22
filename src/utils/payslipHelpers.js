// ─── Payslip Formatting helpers ─────────────────────────────────────────────────────────────
// Used in PayslipPdf.jsx and PayslipPreview.jsx
export function formatPdfDate(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}年${m}月${d}`;
}

// "Close at month-end, paid on the 15th of the following month":
// > Payment is always the 15th of the month following the payslip month
export function getPaymentDate(year, month) {
  const m = Number(month);
  const y = Number(year);
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  return `${nextYear}年${String(nextMonth).padStart(2, "0")}月15日`;
}

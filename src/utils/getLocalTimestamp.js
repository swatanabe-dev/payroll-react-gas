// ─── Generate PDF Helper ─────────────────────────────────────────────────────────────
// Timestamp for a PDF file name
export function getFormattedLocalTimestamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0"); // Strict local day
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0"); // Added seconds to prevent browser (1) collisions

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

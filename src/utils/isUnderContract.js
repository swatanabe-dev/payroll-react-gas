// ─── Users table helper ─────────────────────────────────────────────────────────────

export function isUnderContract(dateStr) {
  if (dateStr === "") return "Active";

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof dateStr !== "string" || !regex.test(dateStr)) {
    console.error("Date must be a string in 'yyyy-mm-dd' format.");
    return "error";
  }

  return new Date(dateStr) - new Date() > 0 ? "Active" : "Ended";
}

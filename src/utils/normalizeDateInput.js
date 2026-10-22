// ─── Work logs date search helpers ─────────────────────────────────────────────────────────────
// <Search />
export function normalizeDateInput(str) {
  return str
    .normalize("NFKC")
    .replace(/[ー‐−―]/g, "-")
    .trim();
}

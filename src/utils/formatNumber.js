// KEEP THIS!!! Used in many places
export function formatNumber(number) {
  const value = number ?? 0;
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

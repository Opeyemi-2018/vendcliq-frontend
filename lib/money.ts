export { formatNaira } from "./salesFilters";

/** A plain amount for an input field: "1787.25", "540" — no separators, no
 * rounding, so what's pre-filled is exactly what's owed. */
export const plainAmount = (value?: number | null): string => {
  const n = Math.round((Number(value) || 0) * 100) / 100;
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

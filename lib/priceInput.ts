/**
 * Display-only money formatting for form inputs. The value handed back to the
 * form stays a plain numeric string — the grouping is never submitted.
 */

/** "1234567.5" → "1,234,567.5" while the user is typing. */
export const formatPriceInput = (raw: string | number | undefined): string => {
  if (raw === undefined || raw === null || raw === "") return "";

  const value = String(raw);
  // Keep a trailing "." or "1." so typing a decimal is not swallowed.
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  const decimals = rest.join("");

  const grouped = whole ? Number(whole).toLocaleString("en-NG") : "";

  if (!cleaned.includes(".")) return grouped;
  return `${grouped}.${decimals.slice(0, 2)}`;
};

/** "1,234,567.50" → "1234567.50" for storage and submission. */
export const parsePriceInput = (formatted: string): string => {
  const cleaned = formatted.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("").slice(0, 2)}`;
};

/**
 * Quantities can come back fractional when a pack is divided into pieces, so
 * they must not be rounded — but whole numbers should not gain ".00" either.
 */
export const formatQty = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null || value === "") return "0";
  const n = typeof value === "number" ? value : parseFloat(value);
  if (!Number.isFinite(n)) return "0";
  if (Number.isInteger(n)) return n.toLocaleString("en-NG");
  // Two decimals is what the pieces division produces; 1.5 stays "1.5".
  return n.toLocaleString("en-NG", { maximumFractionDigits: 2 });
};

/**
 * A piece is indivisible, so piece counts are whole. The fraction is an
 * artifact of the pack figure being rounded — 1.33 packs of 12 is really 16
 * pieces, not 15.96 — so round rather than truncate.
 */
export const piecesOf = (
  packs: string | number | undefined | null,
  itemsPerPack: number | undefined | null,
): number => {
  const p = typeof packs === "number" ? packs : parseFloat(packs ?? "0");
  const per = Number(itemsPerPack) || 0;
  if (!Number.isFinite(p) || !per) return 0;
  return Math.round(p * per);
};

/** Whole piece count, grouped for display. */
export const formatPieces = (
  packs: string | number | undefined | null,
  itemsPerPack: number | undefined | null,
): string => piecesOf(packs, itemsPerPack).toLocaleString("en-NG");

/**
 * How a vendor actually counts stock: whole packs plus the loose bottles left
 * over, rather than a decimal. 1.33 packs of 12 reads as "1pck.4pcs".
 * Falls back to the plain number when the pack size is unknown.
 */
export const formatPacks = (
  packs: string | number | undefined | null,
  itemsPerPack: number | undefined | null,
): string => {
  const per = Number(itemsPerPack) || 0;
  const raw = typeof packs === "number" ? packs : parseFloat(packs ?? "0");
  if (!Number.isFinite(raw)) return "0";
  if (per <= 1) return formatQty(raw);

  const total = piecesOf(raw, per);
  const whole = Math.floor(total / per);
  const loose = total % per;

  const packLabel = `${whole.toLocaleString("en-NG")}pck${whole === 1 ? "" : "s"}`;
  const looseLabel = `${loose}pcs`;

  // Nothing left is still counted in packs — "0pcs" would read as loose bottles.
  if (total === 0) return "0pcks";
  if (whole === 0) return looseLabel;
  if (loose === 0) return packLabel;
  return `${packLabel}.${looseLabel}`;
};

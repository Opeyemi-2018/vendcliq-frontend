import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  differenceInCalendarDays,
} from "date-fns";

export type PeriodId = "today" | "yesterday" | "week" | "month" | "custom";

export interface DateRange {
  /** yyyy-MM-dd */
  start: string;
  /** yyyy-MM-dd */
  end: string;
}

export const PERIOD_OPTIONS: { id: PeriodId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "custom", label: "Custom date range" },
];

const iso = (d: Date) => format(d, "yyyy-MM-dd");

/** Resolve a period preset into a concrete yyyy-MM-dd range. */
export const resolvePeriod = (
  period: PeriodId,
  custom?: Partial<DateRange>,
): DateRange => {
  const now = new Date();

  switch (period) {
    case "today":
      return { start: iso(now), end: iso(now) };
    case "yesterday": {
      const y = subDays(now, 1);
      return { start: iso(y), end: iso(y) };
    }
    case "week":
      return {
        start: iso(startOfWeek(now, { weekStartsOn: 1 })),
        end: iso(endOfWeek(now, { weekStartsOn: 1 })),
      };
    case "month":
      return { start: iso(startOfMonth(now)), end: iso(endOfMonth(now)) };
    case "custom":
      return {
        start: custom?.start || iso(now),
        end: custom?.end || iso(now),
      };
  }
};

/**
 * The equivalent window immediately before `range`, used for the change chip.
 * A 1-day range compares against the previous day, a 7-day range against the
 * previous 7 days, and so on.
 */
export const previousRange = (range: DateRange): DateRange => {
  const start = new Date(range.start);
  const end = new Date(range.end);
  const lengthInDays = differenceInCalendarDays(end, start) + 1;

  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, lengthInDays - 1);

  return { start: iso(prevStart), end: iso(prevEnd) };
};

/** Label shown on the period dropdown button. */
export const periodLabel = (period: PeriodId, range: DateRange): string => {
  if (period !== "custom") {
    return PERIOD_OPTIONS.find((p) => p.id === period)?.label ?? "Today";
  }
  const start = new Date(range.start);
  const end = new Date(range.end);
  if (range.start === range.end) return format(start, "d MMM");
  return `${format(start, "d MMM")} – ${format(end, "d MMM")}`;
};

/** The comparison wording next to the change chip. */
export const comparisonLabel = (period: PeriodId): string => {
  switch (period) {
    case "today":
    case "yesterday":
      return "vs yesterday";
    case "week":
      return "vs last week";
    case "month":
      return "vs last month";
    case "custom":
      return "vs previous period";
  }
};

/**
 * Money, Nigerian style, no decimals — the format the refresh uses in every
 * hero and list. `hidden` renders the masked form instead.
 */
export const formatNaira = (amount: number, hidden = false): string =>
  hidden ? "₦ ****" : `₦${Math.round(amount || 0).toLocaleString("en-NG")}`;

/** Quantities render to 2 dp throughout the refresh. */
export const formatQuantity = (quantity: number | string): string => {
  const n = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

/** Percentage change between two periods. `null` when there is no baseline. */
export const percentChange = (
  current: number,
  previous: number,
): number | null => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};

/** True when `isoDate` falls inside the (inclusive) range. */
export const isWithinRange = (isoDate: string, range: DateRange): boolean => {
  try {
    const day = format(new Date(isoDate), "yyyy-MM-dd");
    return day >= range.start && day <= range.end;
  } catch {
    return false;
  }
};

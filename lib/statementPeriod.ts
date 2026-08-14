import {
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";

/**
 * The window of time the Transactions screen is showing.
 *
 * `from`/`to` are plain `yyyy-MM-dd` so they survive a round trip through
 * storage and read cleanly in a cache key. The ISO helpers widen them to cover
 * the whole of both days, which is what the endpoint needs — it treats a bare
 * date end as midnight and would otherwise drop the closing day.
 */
export type PeriodPreset =
  | "this-month"
  | "last-month"
  | "last-3-months"
  | "this-year"
  | "custom";

export interface StatementPeriod {
  preset: PeriodPreset;
  from: string;
  to: string;
}

export const PERIOD_PRESETS: { id: PeriodPreset; label: string }[] = [
  { id: "this-month", label: "This month" },
  { id: "last-month", label: "Last month" },
  { id: "last-3-months", label: "Last 3 months" },
  { id: "this-year", label: "This year" },
  { id: "custom", label: "Custom" },
];

const day = (date: Date) => format(date, "yyyy-MM-dd");

/** The bounds for a preset. `custom` keeps whatever dates it already had. */
export const periodFromPreset = (
  preset: Exclude<PeriodPreset, "custom">,
  now: Date = new Date(),
): StatementPeriod => {
  switch (preset) {
    case "last-month": {
      const previous = subMonths(now, 1);
      return {
        preset,
        from: day(startOfMonth(previous)),
        to: day(endOfMonth(previous)),
      };
    }
    case "last-3-months":
      return {
        preset,
        from: day(startOfMonth(subMonths(now, 2))),
        to: day(endOfMonth(now)),
      };
    case "this-year":
      return {
        preset,
        from: day(startOfYear(now)),
        to: day(endOfYear(now)),
      };
    case "this-month":
    default:
      return {
        preset: "this-month",
        from: day(startOfMonth(now)),
        to: day(endOfMonth(now)),
      };
  }
};

/** What the screen opens on. */
export const defaultPeriod = (now: Date = new Date()): StatementPeriod =>
  periodFromPreset("this-month", now);

export const periodStartIso = (period: StatementPeriod) =>
  startOfDay(new Date(`${period.from}T00:00:00`)).toISOString();

export const periodEndIso = (period: StatementPeriod) =>
  endOfDay(new Date(`${period.to}T00:00:00`)).toISOString();

/** "1 Aug 2026 to 31 Aug 2026", the wording the statement header uses. */
export const periodLabel = (period: StatementPeriod) => {
  try {
    const from = format(new Date(`${period.from}T00:00:00`), "d MMM yyyy");
    const to = format(new Date(`${period.to}T00:00:00`), "d MMM yyyy");
    return from === to ? from : `${from} to ${to}`;
  } catch {
    return "Selected period";
  }
};

/** Compact form for a file name: "01Aug2026_to_31Aug2026". */
export const periodFileLabel = (period: StatementPeriod) => {
  try {
    const from = format(new Date(`${period.from}T00:00:00`), "ddMMMyyyy");
    const to = format(new Date(`${period.to}T00:00:00`), "ddMMMyyyy");
    return from === to ? from : `${from}_to_${to}`;
  } catch {
    return "statement";
  }
};

export const isValidPeriod = (period: StatementPeriod) =>
  Boolean(period.from) &&
  Boolean(period.to) &&
  new Date(period.from).getTime() <= new Date(period.to).getTime();

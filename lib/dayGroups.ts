import { format, isSameYear, isToday, isYesterday } from "date-fns";

export interface DayGroup<T> {
  /** Stable key for React — the calendar day, not the display label. */
  key: string;
  label: string;
  items: T[];
}

/**
 * "Today · 14 Aug", "Yesterday · 13 Aug", then "Monday · 11 Aug".
 *
 * A date outside the current year carries its year, because a range can reach
 * back far enough for "Monday · 15 Dec" to be genuinely ambiguous.
 */
export const dayLabel = (date: Date, now: Date = new Date()) => {
  const sameYear = isSameYear(date, now);
  const short = sameYear ? format(date, "d MMM") : format(date, "d MMM yyyy");
  if (isToday(date)) return `Today · ${short}`;
  if (isYesterday(date)) return `Yesterday · ${short}`;
  return `${format(date, "EEEE")} · ${short}`;
};

/**
 * Buckets a list into calendar days, keeping the order it arrived in — the
 * callers all sort newest-first before grouping, so the groups come out that
 * way too.
 */
export const groupByDay = <T>(
  items: T[],
  dateOf: (item: T) => string,
): DayGroup<T>[] => {
  const groups = new Map<string, DayGroup<T>>();

  for (const item of items) {
    const date = new Date(dateOf(item));
    const valid = !Number.isNaN(date.getTime());
    const key = valid ? format(date, "yyyy-MM-dd") : "unknown";
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
      continue;
    }
    groups.set(key, {
      key,
      label: valid ? dayLabel(date) : "Earlier",
      items: [item],
    });
  }

  return [...groups.values()];
};

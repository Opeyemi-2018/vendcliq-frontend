"use client";

import { useEffect, useState } from "react";
import { DateRange, PeriodId } from "./salesFilters";

interface FilterState {
  period: PeriodId;
  custom: Partial<DateRange>;
  storeId: string;
  /** False until the user actually picks something, so each page can keep
   *  its own sensible default (overview: today, sales history: this week). */
  chosen: boolean;
}

/*
 * Module-level so a selection survives client-side navigation between the
 * overview, sales history and back — but resets on a hard refresh, which is
 * the behaviour asked for. Deliberately not localStorage: a filter that
 * outlives the session would be its own surprise.
 */
let state: FilterState = {
  period: "today",
  custom: {},
  storeId: "all",
  chosen: false,
};

const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const setSalesFilter = (patch: Partial<Omit<FilterState, "chosen">>) => {
  state = { ...state, ...patch, chosen: true };
  emit();
};

export const getSalesFilter = () => state;

/**
 * Subscribes to the shared filter. `fallbackPeriod` applies only until the
 * user makes a choice of their own.
 */
export const useSalesFilter = (fallbackPeriod: PeriodId = "today") => {
  const [, force] = useState(0);

  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    period: state.chosen ? state.period : fallbackPeriod,
    custom: state.custom,
    storeId: state.storeId,
    setPeriod: (period: PeriodId) => setSalesFilter({ period }),
    setCustom: (custom: Partial<DateRange>) =>
      setSalesFilter({ custom: { ...state.custom, ...custom } }),
    setStoreId: (storeId: string) => setSalesFilter({ storeId }),
  };
};

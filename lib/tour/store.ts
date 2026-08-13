"use client";

import { useEffect, useState } from "react";
import { TOUR_STEPS } from "./steps";

export type TourPhase = "idle" | "welcome" | "run" | "end";

/** Set once the welcome card has been answered, so it never auto-opens again. */
const SEEN_KEY = "vc:tour-seen";

interface TourState {
  phase: TourPhase;
  index: number;
}

let state: TourState = { phase: "idle", index: 0 };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const set = (patch: Partial<TourState>) => {
  state = { ...state, ...patch };
  emit();
};

export const hasSeenTour = () => {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true; // Storage blocked — better silent than nagging every load.
  }
};

const markSeen = () => {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* nothing to do; the tour just may offer itself again */
  }
};

/** The welcome card, either on first login or from the sidebar card. */
export const openTourWelcome = () => set({ phase: "welcome", index: 0 });

export const beginTour = () => {
  markSeen();
  set({ phase: "run", index: 0 });
};

export const endTour = () => {
  markSeen();
  set({ phase: "idle", index: 0 });
};

export const finishTour = () => {
  markSeen();
  set({ phase: "end" });
};

export const goToStep = (index: number) => {
  if (index < 0) return;
  if (index >= TOUR_STEPS.length) {
    finishTour();
    return;
  }
  set({ index });
};

export const nextStep = () => goToStep(state.index + 1);
export const backStep = () => goToStep(Math.max(0, state.index - 1));

export const getTourState = () => state;

export const useTour = () => {
  const [, force] = useState(0);
  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return state;
};

/**
 * The `data-tour` key of the stop currently showing, or null. Pages use this to
 * put themselves in the state a stop describes — the Sell screen, for one,
 * shows a sample product so the pack format has something to point at.
 */
export const useActiveTourTarget = (): string | null => {
  const { phase, index } = useTour();
  if (phase !== "run") return null;
  return TOUR_STEPS[index]?.target ?? null;
};

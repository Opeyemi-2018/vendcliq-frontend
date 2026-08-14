"use client";

import { useCallback, useEffect, useState } from "react";

export type ShortcutSurface = "inventory" | "account";

const storageKey = (surface: ShortcutSurface) => `vc:shortcuts:${surface}`;

/**
 * Pinned shortcuts per surface, persisted to localStorage. Unlike the date
 * filter, this is a genuine preference — it should outlive the session.
 */
export const useShortcutPins = (
  surface: ShortcutSurface,
  defaults: string[],
) => {
  const [pins, setPins] = useState<string[]>(defaults);
  const [hydrated, setHydrated] = useState(false);

  // Read after mount so the server and first client render agree.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(surface));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setPins(parsed);
      }
    } catch {
      /* a malformed or unavailable store just means defaults */
    }
    setHydrated(true);
  }, [surface]);

  const persist = useCallback(
    (next: string[]) => {
      setPins(next);
      try {
        window.localStorage.setItem(storageKey(surface), JSON.stringify(next));
      } catch {
        /* private mode etc. — the choice still applies for this session */
      }
    },
    [surface],
  );

  const reset = useCallback(() => persist(defaults), [persist, defaults]);

  return { pins, setPins: persist, reset, hydrated };
};

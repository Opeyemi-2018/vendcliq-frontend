import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { handleGetTransactions } from "@/lib/utils/api/apiHelper";
import {
  periodEndIso,
  periodStartIso,
  type StatementPeriod,
} from "@/lib/statementPeriod";
import { Transaction } from "@/types/transactions";

export const transactionKeys = {
  list: (page: number, limit: number) =>
    ["transactions", page, limit] as const,
  period: (from: string, to: string) =>
    ["transactions", "period", from, to] as const,
};

/**
 * Wallet transactions. Shared by the account overview and Transactions History
 * so both read the same cache rather than each fetching their own copy.
 */
export const useTransactions = (page = 1, limit = 50) =>
  useQuery({
    queryKey: transactionKeys.list(page, limit),
    queryFn: async (): Promise<Transaction[]> => {
      try {
        const response = await handleGetTransactions(page, limit);
        return response?.data?.items ?? [];
      } catch (error: unknown) {
        // A wallet with no history answers 404 — that is empty, not broken.
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) return [];
        throw error;
      }
    },
    staleTime: 60 * 1000,
  });

const isNotFound = (error: unknown) =>
  (error as { response?: { status?: number } })?.response?.status === 404;

/**
 * Every transaction between two ISO timestamps.
 *
 * Page one tells us how many there are; the rest go out together, so the wall
 * clock is roughly two requests rather than one per page. A page that fails on
 * its own is dropped rather than losing the pages that did land.
 */
export const fetchTransactionsBetween = async (
  startIso: string,
  endIso?: string,
  limit = 100,
): Promise<Transaction[]> => {
  try {
    const first = await handleGetTransactions(1, limit, startIso, endIso);
    const items = first?.data?.items ?? [];
    const totalPages = first?.data?.pagination?.totalPages ?? 1;
    if (totalPages <= 1) return items;

    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        handleGetTransactions(i + 2, limit, startIso, endIso)
          .then((page) => page?.data?.items ?? [])
          .catch(() => [] as Transaction[]),
      ),
    );

    return [...items, ...rest.flat()];
  } catch (error: unknown) {
    if (isNotFound(error)) return [];
    throw error;
  }
};

// ─── Session cache ──────────────────────────────────────────────────────────
// Changing the period should not re-fetch a period already looked at, and that
// should hold across a reload. React Query alone forgets on reload, so each
// period's rows are mirrored into sessionStorage and seeded back on mount.

const CACHE_PREFIX = "vc.transactions.period.";

interface CachedPeriod {
  at: number;
  items: Transaction[];
}

const readCache = (from: string, to: string): CachedPeriod | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${from}_${to}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as CachedPeriod;
    return Array.isArray(parsed?.items) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const writeCache = (from: string, to: string, items: Transaction[]) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      `${CACHE_PREFIX}${from}_${to}`,
      JSON.stringify({ at: Date.now(), items } satisfies CachedPeriod),
    );
  } catch {
    // A full quota only costs us the shortcut, so carry on.
  }
};

/** Drop every cached period — used when the user asks for a refresh. */
export const clearTransactionPeriodCache = () => {
  if (typeof window === "undefined") return;
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Nothing to do if storage is unavailable.
  }
};

/**
 * The transactions falling inside the selected period.
 *
 * Filtering happens on the server, so a wallet with hundreds of postings only
 * ever pulls the month on screen instead of its whole history.
 */
export const useTransactionsInPeriod = (period: StatementPeriod) => {
  const queryClient = useQueryClient();
  const cached = readCache(period.from, period.to);

  const query = useQuery({
    queryKey: transactionKeys.period(period.from, period.to),
    queryFn: () =>
      fetchTransactionsBetween(periodStartIso(period), periodEndIso(period)),
    staleTime: 60 * 1000,
    initialData: cached?.items,
    initialDataUpdatedAt: cached?.at,
    placeholderData: (previous) => previous,
  });

  // Mirror whatever the query settled on, so a reload starts from it.
  const { data, isFetching } = query;
  useEffect(() => {
    if (data && !isFetching) writeCache(period.from, period.to, data);
  }, [data, isFetching, period.from, period.to]);

  const refresh = () => {
    clearTransactionPeriodCache();
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  return { ...query, refresh };
};

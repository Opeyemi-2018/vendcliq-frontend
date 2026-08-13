import { useQuery } from "@tanstack/react-query";
import { handleGetTransactions } from "@/lib/utils/api/apiHelper";
import { Transaction } from "@/types/transactions";

export const transactionKeys = {
  list: (page: number, limit: number) =>
    ["transactions", page, limit] as const,
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

/**
 * Every transaction, for the history page. The previous implementation walked
 * the pages one at a time before rendering anything — 6 pages at ~1.8s each is
 * ~11s of blank screen. This fetches page 1, then the rest in parallel, so the
 * wall clock is roughly two requests instead of six.
 */
export const useAllTransactions = (limit = 50) =>
  useQuery({
    queryKey: ["transactions", "all", limit] as const,
    queryFn: async (): Promise<Transaction[]> => {
      try {
        const first = await handleGetTransactions(1, limit);
        const items = first?.data?.items ?? [];
        const totalPages = first?.data?.pagination?.totalPages ?? 1;
        if (totalPages <= 1) return items;

        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            handleGetTransactions(i + 2, limit)
              .then((page) => page?.data?.items ?? [])
              // One bad page should not lose the pages that did load.
              .catch(() => [] as Transaction[]),
          ),
        );

        return [...items, ...rest.flat()];
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) return [];
        throw error;
      }
    },
    staleTime: 60 * 1000,
  });

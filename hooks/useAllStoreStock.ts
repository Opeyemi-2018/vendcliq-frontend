import { useQuery } from "@tanstack/react-query";
import { getStoreStock } from "@/lib/utils/api/apiHelper";
import { Store, StoreStockItem } from "@/types/store";

/**
 * Stock across every store, fetched in parallel. The API is per-store, so
 * "All stores" needs one request each — sequential would scale badly with the
 * number of branches.
 */
export const useAllStoreStock = (stores: Store[]) =>
  useQuery({
    queryKey: ["stores", "stock", stores.map((s) => s.id).sort()] as const,
    enabled: stores.length > 0,
    queryFn: async (): Promise<StoreStockItem[]> => {
      const results = await Promise.all(
        stores.map((store) =>
          getStoreStock(store.id)
            .then((res) =>
              res?.statusCode === 200 && Array.isArray(res.data)
                ? (res.data as StoreStockItem[])
                : [],
            )
            // One unreachable store should not blank the whole list.
            .catch(() => [] as StoreStockItem[]),
        ),
      );
      return results.flat();
    },
    staleTime: 60 * 1000,
  });

export type StockFlag = "out" | "low" | "expiring" | "ok";

/** Low is the product's own alert threshold when set, else 10. */
export const stockFlagOf = (item: StoreStockItem): StockFlag => {
  const qty = parseFloat(item.quantity ?? "0") || 0;
  if (qty <= 0) return "out";
  const threshold = item.stock_alert_no ?? 10;
  if (qty <= threshold) return "low";

  if (item.exp_date) {
    const days =
      (new Date(item.exp_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    if (Number.isFinite(days) && days <= 30) return "expiring";
  }
  return "ok";
};

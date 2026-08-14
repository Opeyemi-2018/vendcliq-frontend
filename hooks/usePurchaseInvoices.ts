import { useQueries, useQuery } from "@tanstack/react-query";
import {
  handleGetPurchasedInvoices,
  handleGetPurchasedInvoiceById,
  handleGetItemTrackingStatus,
} from "@/lib/utils/api/apiHelper";

export const purchaseKeys = {
  all: ["purchased-invoices"] as const,
  page: (page: number) => ["purchased-invoices", "page", page] as const,
  detail: (id: string) => ["purchased-invoices", id] as const,
  tracking: (itemId: string) => ["item-tracking", itemId] as const,
};

/**
 * One page at a time: there are hundreds of invoices, and the endpoint pages
 * them server-side. The pagination block travels with the rows so the screen
 * knows how many pages there are.
 */
export const usePurchasedInvoices = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: purchaseKeys.page(page),
    queryFn: async () => {
      const response = await handleGetPurchasedInvoices(page, limit);
      if (response.statusCode === 200 && Array.isArray(response.data)) {
        return { rows: response.data, pagination: response.pagination };
      }
      throw new Error(response.error || "Failed to load invoices");
    },
    staleTime: 3 * 60 * 1000,
    placeholderData: (previous) => previous,
  });
};

export const usePurchasedInvoiceById = (id: string) => {
  return useQuery({
    queryKey: purchaseKeys.detail(id),
    queryFn: async () => {
      const response = await handleGetPurchasedInvoiceById(id);
      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.error || "Failed to load invoice details");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useItemTrackingStatus = (itemId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: purchaseKeys.tracking(itemId),
    queryFn: async () => {
      const response = await handleGetItemTrackingStatus(itemId);
      if (response.statusCode === 200 && response.data) {
        return response.data;
      }
      if (response.message) {
        throw new Error(response.message);
      }
      throw new Error("No tracking information available");
    },
    enabled: !!itemId && enabled,
    staleTime: 1 * 60 * 1000,
    retry: 1,
  });
};

/**
 * Whether each invoice on the page has an item being delivered.
 *
 * The list endpoint carries no delivery flag and sends an empty items array,
 * so this is the only way to know today: fetch each invoice on the visible
 * page and look at its items. React Query caches per invoice, so paging back
 * and forth costs nothing. Including the flag in the list response would make
 * this fan-out unnecessary.
 */
export const useInvoiceDelivery = (ids: string[]) => {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: purchaseKeys.detail(id),
      queryFn: async () => {
        const response = await handleGetPurchasedInvoiceById(id);
        if (response.statusCode === 200 && response.data) return response.data;
        throw new Error(response.error || "Failed to load invoice");
      },
      staleTime: 5 * 60 * 1000,
    })),
  });

  const map: Record<string, boolean> = {};
  results.forEach((result, i) => {
    const items = result.data?.items;
    if (Array.isArray(items)) {
      map[ids[i]] = items.some((item) => item?.delivery === true);
    }
  });
  return map;
};

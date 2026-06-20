import { useQuery } from "@tanstack/react-query";
import {
  handleGetPurchasedInvoices,
  handleGetPurchasedInvoiceById,
  handleGetItemTrackingStatus,
} from "@/lib/utils/api/apiHelper";

export const purchaseKeys = {
  all: ["purchased-invoices"] as const,
  detail: (id: string) => ["purchased-invoices", id] as const,
  tracking: (itemId: string) => ["item-tracking", itemId] as const,
};

export const usePurchasedInvoices = () => {
  return useQuery({
    queryKey: purchaseKeys.all,
    queryFn: async () => {
      const response = await handleGetPurchasedInvoices();
      if (response.statusCode === 200 && Array.isArray(response.data)) {
        return response.data;
      }
      throw new Error(response.error || "Failed to load invoices");
    },
    staleTime: 3 * 60 * 1000,
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
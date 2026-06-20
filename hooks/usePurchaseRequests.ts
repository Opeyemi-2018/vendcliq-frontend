import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { isSameDay } from "date-fns";
import {
  getPurchaseRequest,
  getPurchaseRequestById,
} from "@/lib/utils/api/apiHelper";

export const purchaseRequestKeys = {
  all: ["purchase-requests"] as const,
  recent: ["purchase-requests", "recent"] as const,
  detail: (id: string) => ["purchase-requests", id] as const,
  filtered: (date: Date | undefined) => ["purchase-requests", "filtered", date] as const,
  item: (requestId: string, itemId: string) => ["purchase-requests", requestId, "item", itemId] as const,
};

export const usePurchaseRequests = () => {
  return useQuery({
    queryKey: purchaseRequestKeys.all,
    queryFn: async () => {
      const result = await getPurchaseRequest();
      return Array.isArray(result) ? result : [];
    },
    staleTime: 3 * 60 * 1000,
  });
};

export const useRecentPurchaseRequests = (limit: number = 10) => {
  return useQuery({
    queryKey: purchaseRequestKeys.recent,
    queryFn: async () => {
      const result = await getPurchaseRequest();
      return Array.isArray(result) ? result.slice(0, limit) : [];
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useFilteredPurchaseRequests = (selectedDate: Date | undefined) => {
  const { data: allRequests = [], isLoading, error, refetch } = usePurchaseRequests();

  const filteredRequests = useMemo(() => {
    let filtered = [...allRequests];

    if (selectedDate) {
      filtered = filtered.filter((req) => {
        try {
          const reqDate = new Date(req.created_at);
          return isSameDay(reqDate, selectedDate);
        } catch {
          return false;
        }
      });
    }

    return filtered;
  }, [allRequests, selectedDate]);

  return {
    data: filteredRequests,
    allRequests,
    isLoading,
    error,
    refetch,
  };
};

export const usePurchaseRequestById = (id: string) => {
  return useQuery({
    queryKey: purchaseRequestKeys.detail(id),
    queryFn: async () => {
      const result = await getPurchaseRequestById(id);
      if (result.statusCode === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Failed to load purchase request");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePurchaseRequestItem = (requestId: string, itemId: string) => {
  const { data: request, isLoading, error } = usePurchaseRequestById(requestId);

  const item = useMemo(() => {
    if (!request?.items) return null;
    return request.items.find((i) => i.id === itemId) || null;
  }, [request, itemId]);

  return {
    data: item,
    request,
    isLoading,
    error: item === null && !isLoading ? new Error("Item not found") : error,
  };
};
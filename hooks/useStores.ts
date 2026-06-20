/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStores,
  getStoreById,
  getStoreStock,
  getStockDetail,
  handleCreateStore,
  handleCreateStock,
  handleUpdateStore,
  handleUpdateStoreSettings,
  updateStock,
  updateStockWithMovement,
  handleGetStockMovements,
} from "@/lib/utils/api/apiHelper";
import { Store, StoreStockItem, StoreStockDetail } from "@/types/store";
import { StockMovement } from "@/types/stock";

// ============================================
// QUERY KEYS
// ============================================

export const storeKeys = {
  all: ["stores"] as const,
  detail: (id: string) => ["stores", id] as const,
  stocks: (storeId: string) => ["stores", storeId, "stocks"] as const,
  stockDetail: (storeId: string, stockId: string) =>
    ["stores", storeId, "stocks", stockId] as const,
  stockMovements: (stockId: string) => ["stock-movements", stockId] as const,
};

// ============================================
// QUERY HOOKS (GET)
// ============================================

export const useStores = () => {
  return useQuery({
    queryKey: storeKeys.all,
    queryFn: async () => {
      const result = await getStores();
      if (result.statusCode === 200 && result.data) {
        return result.data as Store[];
      }
      throw new Error(result.error || "Failed to load stores");
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useStoreById = (storeId: string) => {
  return useQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: async () => {
      const result = await getStoreById(storeId);
      if (result?.data) {
        return result.data as Store;
      }
      throw new Error("Failed to load store details");
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useStoreStocks = (storeId: string) => {
  return useQuery({
    queryKey: storeKeys.stocks(storeId),
    queryFn: async () => {
      const result = await getStoreStock(storeId);
      if (result?.data) {
        return result.data as StoreStockItem[];
      }
      return [];
    },
    enabled: !!storeId,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useStockDetail = (storeId: string, stockId: string) => {
  return useQuery({
    queryKey: storeKeys.stockDetail(storeId, stockId),
    queryFn: async () => {
      const result = await getStockDetail(stockId, storeId);
      if (result.statusCode === 200 && result.data) {
        return result.data as StoreStockDetail;
      }
      throw new Error(result.error || "Failed to load stock details");
    },
    enabled: !!storeId && !!stockId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useStockMovements = (stockId: string) => {
  return useQuery({
    queryKey: storeKeys.stockMovements(stockId),
    queryFn: async () => {
      const result = await handleGetStockMovements(stockId);
      if (result.statusCode === 200 && result.data) {
        return result.data as StockMovement[];
      }
      return [];
    },
    enabled: !!stockId,
    staleTime: 2 * 60 * 1000,
  });
};

// ============================================
// MUTATION HOOKS (CREATE/UPDATE/DELETE)
// ============================================

export const useCreateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => handleCreateStore(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, payload }: { storeId: string; payload: any }) =>
      handleUpdateStore(storeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(variables.storeId) });
    },
  });
};

export const useUpdateStoreSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, payload }: { storeId: string; payload: any }) =>
      handleUpdateStoreSettings(storeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(variables.storeId) });
    },
  });
};

export const useCreateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => handleCreateStock(payload),
    onSuccess: (_, variables) => {
      // Invalidate stocks for this store
      queryClient.invalidateQueries({ queryKey: storeKeys.stocks(variables.store_id) });
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stockId, data }: { stockId: string; data: any }) =>
      updateStock(stockId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.stockMovements(variables.stockId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
};

export const useUpdateStockWithMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stockId, data }: { stockId: string; data: any }) =>
      updateStockWithMovement(stockId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.stockMovements(variables.stockId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
};
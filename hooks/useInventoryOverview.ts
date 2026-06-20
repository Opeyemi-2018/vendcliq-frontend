import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { isSameDay } from "date-fns";
import {
  getSales,
  getTotalSales,
  getSaleById,
  handleReturnItems,
  handleCreateInvoice,
  handleUpdateInvoice,
} from "@/lib/utils/api/apiHelper";
import { SupplierSalesResponse } from "@/types/sales";

export const dashboardKeys = {
  salesData: (startDate: string, endDate: string) =>
    ["sales-data", startDate, endDate] as const,
  recentSales: ["recent-sales"] as const,
  recentPurchases: ["recent-purchases"] as const,
  allSales: ["sales"] as const,
  saleInvoice: (id: string) => ["sale-invoice", id] as const,
  soldItem: (invoiceId: string, itemId: string) =>
    ["sold-item", invoiceId, itemId] as const,
};

export const useSalesData = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: dashboardKeys.salesData(startDate, endDate),
    queryFn: async () => {
      const data: SupplierSalesResponse = await getTotalSales(startDate, endDate);
      return {
        totalSales: data.total_sales ?? 0,
        mediumBreakdown: data.medium ?? {},
      };
    },
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRecentSales = () => {
  return useQuery({
    queryKey: dashboardKeys.recentSales,
    queryFn: async () => {
      const salesRes = await getSales();
      return Array.isArray(salesRes) ? salesRes.slice(0, 10) : [];
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useSales = () => {
  return useQuery({
    queryKey: dashboardKeys.allSales,
    queryFn: async () => {
      const salesData = await getSales();
      return Array.isArray(salesData) ? salesData : [];
    },
    staleTime: 3 * 60 * 1000,
  });
};

export const useFilteredSales = (statusFilter: string, selectedDate: Date | undefined) => {
  const { data: allSales = [], isLoading, error, refetch } = useSales();

  const filteredInvoices = useMemo(() => {
    let filtered = [...allSales];

    if (selectedDate) {
      filtered = filtered.filter((inv) => {
        try {
          const invDate = new Date(inv.created_at);
          return isSameDay(invDate, selectedDate);
        } catch {
          return false;
        }
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (inv) => inv.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return filtered;
  }, [allSales, selectedDate, statusFilter]);

  return {
    data: filteredInvoices,
    allSales,
    isLoading,
    error,
    refetch,
  };
};

export const useSaleInvoice = (id: string) => {
  return useQuery({
    queryKey: dashboardKeys.saleInvoice(id),
    queryFn: async () => {
      const res = await getSaleById(id);
      if (res.statusCode === 200 && res.data) {
        return res.data;
      }
      throw new Error(res.error || "Failed to load invoice");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSoldItem = (invoiceId: string, itemId: string) => {
  const { data: invoice, isLoading, error } = useSaleInvoice(invoiceId);

  const item = useMemo(() => {
    if (!invoice?.items) return null;
    return invoice.items.find((i) => i.id === itemId) || null;
  }, [invoice, itemId]);

  return {
    data: item,
    invoice,
    isLoading,
    error: item === null && !isLoading ? new Error("Item not found") : error,
  };
};

export const useReturnItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { invoice_id: string; items: { item_id: string; quantity: number; reason: string }[] }) =>
      handleReturnItems(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saleInvoice(variables.invoice_id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.allSales });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.recentSales });
    },
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => handleCreateInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.allSales });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.recentSales });
      queryClient.invalidateQueries({ queryKey: ["sales-data"] });
    },
  });
};

// ✅ NEW: Mutation for updating invoice
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, payload }: { invoiceId: string; payload: any }) =>
      handleUpdateInvoice(invoiceId, payload),
    onSuccess: (response, variables) => {
      // Invalidate the specific invoice
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saleInvoice(variables.invoiceId) });
      // Invalidate all sales lists
      queryClient.invalidateQueries({ queryKey: dashboardKeys.allSales });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.recentSales });
      queryClient.invalidateQueries({ queryKey: ["sales-data"] });
    },
  });
};
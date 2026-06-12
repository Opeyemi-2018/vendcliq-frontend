/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import {
  getMarketplaceStocks,
  getMarketplaceOffers,
  getMarketplaceStockDetail,
  getOfferDetail,
} from "@/lib/utils/api/apiHelper";
import { OfferStock, RegularStock } from "@/types/marketPlace";

export const marketplaceKeys = {
  allStocks: (search: string, page: number, limit: number) =>
    ["marketplace-stocks", search, page, limit] as const,
  allOffers: ["marketplace-offers"] as const,
  stockDetail: (id: string) => ["marketplace-stock", id] as const,
  offerDetail: (id: string) => ["marketplace-offer", id] as const,
};

export const useMarketplaceStocks = (search = "", page = 1, limit = 20) => {
  return useQuery({
    queryKey: marketplaceKeys.allStocks(search, page, limit),
    queryFn: async () => {
      const result = await getMarketplaceStocks(search, page, limit);
      if (result.statusCode === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Failed to fetch marketplace stocks");
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useMarketplaceOffers = () => {
  return useQuery({
    queryKey: marketplaceKeys.allOffers,
    queryFn: async () => {
      const result = await getMarketplaceOffers();
      if (result.statusCode === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Failed to fetch marketplace offers");
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useCombinedMarketplaceItems = () => {
  const {
    data: stocks = [],
    isLoading: stocksLoading,
    error: stocksError,
    refetch: refetchStocks,
  } = useMarketplaceStocks();

  const {
    data: rawOffers = [],
    isLoading: offersLoading,
    error: offersError,
    refetch: refetchOffers,
  } = useMarketplaceOffers();

  const offers: OfferStock[] = rawOffers.map((o: any) => ({
    ...o,
    id: o.id,
    selling_price: o.price.toString(),
    total_qty: o.qty.toString(),
    isOffer: true,
  }));

  const regularStocks: RegularStock[] = stocks;

  const allItems = [...offers, ...regularStocks];

  return {
    data: allItems,
    offers,
    regularStocks,
    isLoading: stocksLoading || offersLoading,
    error: stocksError || offersError,
    refetch: () => {
      refetchStocks();
      refetchOffers();
    },
  };
};

export const useMarketplaceStockDetail = (id: string) => {
  return useQuery({
    queryKey: marketplaceKeys.stockDetail(id),
    queryFn: async () => {
      const result = await getMarketplaceStockDetail(id);
      if (result.statusCode === 200 && result.data?.stock) {
        return {
          stock: result.data.stock,
          relatedStocks: result.data.relatedStocks || [],
        };
      }
      throw new Error(result.error || "Failed to fetch stock details");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOfferDetail = (id: string) => {
  return useQuery({
    queryKey: marketplaceKeys.offerDetail(id),
    queryFn: async () => {
      const result = await getOfferDetail(id);
      if (result.statusCode === 200 && result.data?.offer) {
        return {
          offer: result.data.offer,
          relatedOffers: result.data.relatedOffers || [],
        };
      }
      throw new Error(result.error || "Failed to fetch offer details");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMarketplaceSearch = () => {
  return useQuery({
    queryKey: ["marketplace-search"],
    queryFn: async () => {
      throw new Error("Use useMarketplaceStocks with search param instead");
    },
    enabled: false,
  });
};

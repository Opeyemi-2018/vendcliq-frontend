// hooks/useProducts.ts
import { useEffect, useState } from "react";
import { handleGetProducts } from "@/lib/utils/api/apiHelper";
import { Product, ProductsResponse } from "@/types/stock";

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchAllProducts: (searchQuery: string) => Promise<Product[]>;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProductsCache, setAllProductsCache] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ProductsResponse = await handleGetProducts(false);

      if (response.statusCode === 200 && response.data) {
        setProducts(response.data);
      } else {
        setError("Failed to load products");
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllProducts = async (searchQuery: string): Promise<Product[]> => {
    // If no search query, return the initial 50
    if (!searchQuery || searchQuery.trim() === "") {
      return products;
    }

    // If we already have all products cached, use them
    if (allProductsCache.length > 0) {
      return allProductsCache;
    }

    // Fetch all products
    try {
      const response: ProductsResponse = await handleGetProducts(true);
      if (response.statusCode === 200 && response.data) {
        setAllProductsCache(response.data);
        return response.data;
      }
      return products; // Fallback to initial products
    } catch (err) {
      console.error("Error fetching all products:", err);
      return products; // Fallback to initial products
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
    fetchAllProducts,
  };
}
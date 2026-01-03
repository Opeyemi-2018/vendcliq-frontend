// hooks/useProducts.ts
import { useEffect, useState } from "react";
import { handleGetProducts } from "@/lib/utils/api/apiHelper";
import { Product, ProductsResponse } from "@/types/stock";

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ProductsResponse = await handleGetProducts();

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

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}
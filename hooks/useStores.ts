// hooks/useStores.ts
import { useEffect, useState } from "react";
import { getStores } from "@/actions/stores";

export interface Store {
  id: string;
  name: string;
  address: {
    lat: number;
    lng: number;
    name: string;
  };
  phone: string;
  stock_value: number;
  stock_count: number;
  low_stock_count: number;
}

interface UseStoresResult {
  stores: Store[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStores(): UseStoresResult {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token =
        typeof window !== "undefined" &&
        (localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken"));

      if (!token) {
        setError("Please log in to view stores");
        setIsLoading(false);
        return;
      }

      const result = await getStores(token);

      if (result.success && result.data) {
        setStores(result.data);
      } else {
        setError(result.error || "Failed to load stores");
      }
    } catch (err) {
      console.error("Error loading stores:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    stores,
    isLoading,
    error,
    refetch: fetchStores,
  };
}
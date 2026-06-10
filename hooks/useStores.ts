import { useEffect, useState } from "react";
import { getStores } from "@/lib/utils/api/apiHelper";

export interface Store {
  id: string;
  name: string;
  address: { lat: number; lng: number; name: string };
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
      const result = await getStores();
      if (result?.data) {
        setStores(result.data);
      } else {
        setError("Failed to load stores");
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

  return { stores, isLoading, error, refetch: fetchStores };
}
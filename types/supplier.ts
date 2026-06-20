/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Supplier {
  data: any;
  id: number; // Changed from string to number based on your API response
  user_id: number; // Changed from string to number
  name: string;
  email: string;
  phone: string;
  state: string | null;
  address: string;
  type: string;
  logo?: string | null;
  wallet: {
    bank_name: string;
    email: string;
    account_number: string;
    currency: string;
    account_name?: string;
  };
}

export interface GetSuppliersResponse {
  statusCode: number;
  error: string | null;
  data: Supplier[];
}

// In your types/supplier.ts file
export interface SupplierStockItem {
  id: string;
  sku: string;
  quantity: string;
  selling_price: string;
  product: {
    name: string;
    images?: string;
  };
}

export interface GetSupplierStocksResponse {
  statusCode: number;
  error: string | null;
  data: SupplierStockItem[];
}

export interface SupplierStore {
  id: string;
  name: string;
  address: {
    lat: number | null;
    lng: number | null;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface GetSupplierStoresResponse {
  statusCode: number;
  error: string | null;
  data: SupplierStore[];
}

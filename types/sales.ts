/* eslint-disable @typescript-eslint/no-explicit-any */
// types/sales.ts (or types/invoice.ts)

export interface SaleInvoiceItem {
  id: string;
  stock_id: number;
  product_id: number;
  invoice_id: string | null;
  quantity: number;
  delivery: boolean;
  cost: number;
  discounted_amount: number;
  sub_total: number;
  empties: number | null;
  attributes: Record<string, any>;
  mode: string;
  otp_codes?: {
    driver_otp: string;
    customer_otp: string;
  };
  profit: number;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    image: string | null;
  };
  stock: {
    id: string;
    sku: string;
    qty: string;
    price: number;
  };
}

export interface SaleInvoice {
  total_amount(total_amount: any): import("react").ReactNode;
  id: string;
  user_id: number;
  customer_id: number | null;
  store_id: number;
  terminal_id: number | null;
  total: number;
  empties_value: number;
  code: string;
  status: "PENDING" | "COMPLETED" | string;
  created_at: string;
  updated_at: string;
  attributes: Record<string, any>;
  customer: any | null;
  store: {
    id: string;
    name: string;
    address?: {
      lat: number;
      lng: number;
      name: string;
    };
    phone: string;
    credit_store: boolean;
    attributes: any | null;
    meta: any | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  items_count: number;
  items: SaleInvoiceItem[];
}

export interface SaleListResponse {
  statusCode: number;
  error: string | null;
  data: SaleInvoice[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalCount: number;
    limit: number;
    nextPage: number | null;
  };
}

export interface SaleDetailResponse {
  statusCode: number;
  error: string | null;
  data: SaleInvoice;
}




// resposne for total sales 

// types/supplierSales.ts

export interface SupplierSalesStore {
  store_id: string;
  store_name: string;
  total_sales: number;
  percentage: number;
}

export interface SupplierSalesMedium {
  CASH?: number;
  TRANSFER?: number;
  POS?: number;
  [key: string]: number | undefined; // for any other mediums
}

export interface SupplierSalesResponse {
  total_sales: number;
  stores: SupplierSalesStore[];
  medium: SupplierSalesMedium;
}
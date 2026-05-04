/* eslint-disable @typescript-eslint/no-explicit-any */
// types/sales.ts

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
  id: string;
  user_id: number;
  customer_id: number | null;
  store_id: number;
  terminal_id: number | null;

  // ── totals (all come from the API response top-level AND attributes) ──
  total: number;
  total_amount?: number;      // may not always be present; use total as fallback
  sub_total: number;          // from API: attributes.sub_total promoted to top-level
  total_discount: number;     // from API: attributes.total_discount
  total_quantity: number;     // from API: total_quantity
  amount_payable: number;     // from API: amount_payable
  empties_value: number;
  empties_owed: number;

  code: string;
  status: "PENDING" | "COMPLETED" | string;
  created_at: string;
  updated_at: string;
  attributes: {
    sub_total?: number;
    from_owner?: boolean;
    empties_owed?: number;
    amount_payable?: number;
    total_discount?: number;
    total_quantity?: number;
    [key: string]: any;
  };
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: { address: string; latitude: number; longitude: number } | string;
    type?: string;
    meta?: any;
    totalSales?: number;
    totalEmptiesOwed?: number;
    customer_empties?: any[];
    created_at?: string;
    updated_at?: string;
  } | null;
  store: {
    id: string;
    name: string;
    address?: {
      lat?: number;
      lng?: number;
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

// ── Supplier / total-sales types ──────────────────────────────────────────────

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
  [key: string]: number | undefined;
}

export interface SupplierSalesResponse {
  total_sales: number;
  stores: SupplierSalesStore[];
  medium: SupplierSalesMedium;
}
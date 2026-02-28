/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PurchasedInvoice {
  id: string;
  user_id: number;
  customer_id: string | null;
  store_id: string | null;
  terminal_id: string | null;
  total: number;
  empties_value: number;
  code: string;
  status: string;
  created_at: string;
  updated_at: string;
  attributes: {
    supplier: string | null;
    manual_purchase: boolean;
  } | null; // Add null here
  items: any[];
}

export interface PurchasedInvoicesResponse {
  statusCode: number;
  error: string | null;
  data: PurchasedInvoice[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalCount: number;
    limit: number;
    nextPage: number | null;
  };
}

export interface CreatePurchasePayload {
  supplier?: string;
  proof_of_payment?: {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
  };
  items: Array<{
    stock_id: string;
    quantity: number;
    cost_price: number;
  }>;
}

export interface CreatePurchaseResponse {
  statusCode: number;
  error: string | null;
  data?: {
    id: string;
    user_id: number;
    total: number;
    code: string;
    status: string;
    created_at: string;
    items: Array<{
      id: string;
      stock_id: number;
      quantity: number;
      cost: number;
    }>;
  };
}

// types/purchase.ts - Add these types to existing file

export interface InvoiceItem {
  id: string;
  stock_id: number;
  product_id: number;
  invoice_id: string | null;
  quantity: number;
  delivery: boolean;
  cost: number;
  discounted_amount: number;

  sub_total: number;
  empties: any;
  attributes: {
    offer: boolean;
    address: string;
    storeId: string;
    latitude: number;
    longitude: number;
    directStock: boolean;
  };
  mode: string;
  otp_codes: {
    driver_otp: string;
    customer_otp: string;
  };
  profit: number;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    image: string;
  };
  stock: {
    id: string;
    sku: string;
    qty: string;
    price: number;
  };
}

// purchase invoice details
export interface PurchasedInvoiceDetails {
  id: string;
  user_id: number;
  customer_id: number | null;
  store_id: number | null;
  terminal_id: number | null;
  total: number;
  empties_value: number;
  code: string;
  status: string;
  created_at: string;
  updated_at: string;
  attributes: any;
  customer: any;
  store: any;
  items_count: number;
  items: InvoiceItem[];
}

export interface InvoiceDetailsResponse {
  statusCode: number;
  error: string | null;
  data: PurchasedInvoiceDetails;
}

export interface TrackingStatusResponse {
  statusCode?: number;
  error?: string | null;
  data?: any;
  message?: string; 
}

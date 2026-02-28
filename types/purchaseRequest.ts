/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PurchaseRequestItem {
  /** Unique ID of this item line */
  id: string;

  stock_id: number;
  product_id: number;
  invoice_id: string | null;

  quantity: number;
  delivery: boolean;

  cost: number;
  discounted_amount: number;
  sub_total: number;

  empties: any | null;

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
  } | null;

  stock: {
    id: string;
    sku: string;
    qty: string;
    price: number;
  } | null;
}

/**
 * Core purchase request object
 * Used both in list (partial fields) and detail view (all fields)
 */
export interface PurchaseRequest {
  id: string;
  code: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;

  user_id?: number; // only in detail
  customer_id: number | null;
  store_id: number | null;
  terminal_id: number | null;

  empties_value?: number; // only in detail
  supplier_subtotal?: number; // only in list/detail variations
  attributes?: any | null; // only in detail
  customer?: any | null; // only in detail
  store?: any | null; // only in detail

  items_count?: number; // only in detail
  items: PurchaseRequestItem[]; // partial in list, full in detail
}

/**
 * Full list response (with pagination)
 */
export interface PurchaseRequestListResponse {
  statusCode: number;
  error: null | string;
  data: PurchaseRequest[]; // uses the same core type
  pagination: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    nextPage: number | null;
  };
}

/**
 * Single request response (no pagination)
 */
export interface PurchaseRequestDetailResponse {
  statusCode: number;
  error: null | string;
  data: PurchaseRequest; // same core type, just more fields filled
}

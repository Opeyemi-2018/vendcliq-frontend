/* eslint-disable @typescript-eslint/no-explicit-any */
import z from "zod";

// ─── Store ────────────────────────────────────────────────────────────────────

export interface Store {
  id: string;
  name: string;
  address: {
    lat: number;
    lng: number;
    name: string;
  };
  phone: string;
  credit_store: boolean; // ← added
  attributes: any | null;
  meta: any | null;
  createdAt: string;
  updatedAt: string;
  stock_value: number;
  stock_count: number;
  low_stock_count: number;
}

export interface StoreResponse {
  statusCode: number;
  error: string | null;
  data: Store[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalCount: number;
    limit: number;
    nextPage: number | null;
  };
}

export interface StoreDetailResponse {
  statusCode: number;
  error: string | null;
  data: Store;
}

export interface CreateStoreResponse {
  statusCode: number;
  error: null | string;
  data: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
}

export const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  address: z.object({
    name: z.string().min(1, "Address is required"),
    lat: z.number(),
    lng: z.number(),
  }),
  phone: z.string().min(1, "Phone number is required"),
});

export type CreateStoreFormData = z.infer<typeof createStoreSchema>;

export interface StoreSettingsPayload {
  is_default: boolean;
  show_on_marketplace: boolean;
  is_archived: boolean;
}

export interface StoreSettings {
  id: string;
  is_default: boolean;
  show_on_marketplace: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreSettingsResponse {
  statusCode: number;
  error: string | null;
  data: StoreSettings;
}

export interface UpdateStorePayload {
  address: {
    name: string;
    lat: number;
    lng: number;
  };
  phone: string;
}

export interface UpdateStoreResponse {
  statusCode: number;
  error: string | null;
  data: {
    id: string;
    name: string;
    address: {
      name: string;
      lat: number;
      lng: number;
    };
    phone: string;
    attributes: any | null;
    meta: any | null;
    createdAt: string;
    updatedAt: string;
  };
}

// ─── Stock ────────────────────────────────────────────────────────────────────

export interface StoreStockItem {
  id: string;
  sku: string;
  cost_price: string;
  selling_price: string;
  selling_price_pieces: string;
  empties_price: string;
  exp_date: string | null;
  quantity: string;
  empties_qty: string;
  total_qty: string;
  stock_alert_no: number | null;
  stock_value: string;
  status: string;
  product: {
    id: string;
    name: string;
    items_per_pack: number;
    image: string | null;
  };
  store: {
    id: string;
    name: string;
    address: {
      lat: number;
      lng: number;
      name: string;
    };
  };
  attributes: any | null;
  created_at: string;
  updated_at: string;
  qty_sold?: number;
}

export interface StoreStockDetail {
  id: string;
  sku: string;
  cost_price: string;
  selling_price: string;
  selling_price_pieces: string | null;
  empties_price: string;
  exp_date: string | null;
  quantity: string;
  empties_qty: string;
  total_qty: string;
  stock_alert_no: number | null;
  stock_value: string;
  status: string;
  product: {
    id: string;
    name: string;
    items_per_pack: number;
    image: string | null;
  };
  store: {
    id: string;
    name: string;
    address: {
      lat: number;
      lng: number;
      name: string;
    };
  };
  attributes: any | null;
  created_at: string;
  updated_at: string;
  stats: {
    qty_sold: number;
    total_sales: number;
    qty_added: number;
    date_range: Record<string, any>;
  };
}
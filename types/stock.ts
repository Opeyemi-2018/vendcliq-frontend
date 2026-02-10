/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

export const createStockSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  quantity: z.string().min(1, "Quantity is required"),
  empties_qty: z.string(),
  empties_price: z.string(),
  cost_price: z.string().min(1, "Cost price is required"),
  selling_price: z.string().min(1, "Selling price is required"),
  selling_price_pieces: z.string(),
  exp_date: z.string().min(1, "Expiry date is required"),
  sku: z.string(),
  stock_alert_no: z.string().min(1, "Low stock alert is required"),
  type: z.enum(["packs", "pieces"]),
  batch: z.string(),
  supplier: z.string(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  containerType: z.string(),
  flavour: z.string(),
  itemsPerPack: z.number(),
  manufacturer: z.string(),
  packsPerTruck: z.number(),
  productType: z.string(),
  sizeCl: z.string(),
  pkgType: z.string(),
  status: z.string(),
  slug: z.string().nullable(),
  uniqueId: z.string().nullable(),
});

export type CreateStockFormData = z.infer<typeof createStockSchema>;
export type Product = z.infer<typeof productSchema>;

export interface StockPayload {
  product_id: string;
  store_id: string;
  quantity: number;
  empties_qty: number;
  cost_price: number;
  selling_price: number;
  selling_price_pieces: number;
  empties_price: number;
  exp_date: string;
  sku: string;
  stock_alert_no: number;
  attributes: {
    type: "pieces" | "packs";
    batch: string;
    supplier: string;
  };
}

export interface ProductsResponse {
  statusCode: number;
  error: null | string;
  data: Product[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalCount: number;
    limit: number;
    nextPage: number | null;
  };
}

export interface CreateStockResponse {
  statusCode: number;
  error: null | string;
  data: {
    id: string;
    store_id: string;
    product_id: string;
  };
}

// stock history
export interface StockMovement {
  id: string;
  stock_id: number;
  balance: number;
  quantity: number;
  remark: string | null;
  movement_type: string;
  invoice_id: number | null;
  attributes: {
    address?: string;
    latitude?: number;
    longitude?: number;
    [key: string]: any;
  } | null;
  meta: {
    mode?: string;
    image?: string;
    unit_price?: number;
    product_name?: string;
    [key: string]: any;
  } | null;
  created_at: string;
  updated_at: string;
  stock: {
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
    stock_alert_no: number;
    stock_value: string;
    status: string;
    product: {
      id: string;
      name: string;
      items_per_pack: number;
      image: string;
    };
    store: any | null;
    attributes: Record<string, string> | null;
    created_at: string;
    updated_at: string;
  };
}

export interface StockMovementsResponse {
  statusCode: number;
  error: null | any;
  data: StockMovement[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalCount: number;
    limit: number;
    nextPage: number | null;
  };
}


// updating stock while creating invoice 
export interface UpdateStockPricesPayload {
  selling_price: number;
  selling_price_pieces: number;
  empties_price: number;
}

export interface UpdateStockPricesResponse {
  statusCode: number;
  msg?: string;
  error?: string;
  data?: any;
}
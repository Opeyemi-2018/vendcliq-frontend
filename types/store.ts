/* eslint-disable @typescript-eslint/no-explicit-any */
import z from "zod";


// types/store.ts (or wherever you keep types)

export interface StoreResponse {
  statusCode: number;
  error: string | null;
  data: Array<{
    id: string;
    name: string;
    address: {
      lat: number;
      lng: number;
      name: string;
    };
    phone: string;
    attributes: any | null;
    meta: any | null;
    createdAt: string;
    updatedAt: string;
    stock_value: number;
    stock_count: number;
    low_stock_count: number;
  }>;
  pagination: {
    totalPages: number;
    currentPage: number;
    totalCount: number;
    limit: number;
    nextPage: number | null;
  };
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

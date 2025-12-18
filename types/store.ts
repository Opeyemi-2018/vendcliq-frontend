import z from "zod";

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

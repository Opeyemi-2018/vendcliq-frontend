import z from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  phone: z.string().min(1, "Phone is required"),
  type: z.enum(["Distributor", "Wholesaler", "Retailer"]),
  address: z.object({
    address: z.string().min(1, "Address is required"),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export type CustomerForm = z.infer<typeof customerSchema>;

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone: string;
  type: "Distributor" | "Wholesaler" | "Retailer";
  address: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

export interface CreateCustomerResponse {
  statusCode: number;
  msg?: string;
  error?: string;
  data?: any;
}

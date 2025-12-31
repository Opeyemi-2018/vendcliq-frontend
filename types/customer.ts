// @/types/customer.ts
import z from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "customer name is required"),
  email: z.string().email("must be a valid email").min(1, "email is required"),
  phone: z.string().min(1, "phone is required"),
  type: z.enum(["Wholesaler", "Retailer"], {
    error: () => ({ message: "customer type is required" }),
  }),
  address: z.string().min(1, "address is required"),
});

export type CustomerForm = z.infer<typeof customerSchema>;

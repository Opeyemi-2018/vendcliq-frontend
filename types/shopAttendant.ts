/* eslint-disable @typescript-eslint/no-explicit-any */
import z from "zod";
export interface AddShopAttendantPayload {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  store_ids: string[];
}

export interface AddShopAttendantResponse {
  status: string;
  message: string;
  data?: any;
}

export const shopAttendantSchema = z.object({
  firstname: z.string().min(1, " first name is required"),
  lastname: z.string().min(1, "last name is required"),
  email: z
    .string()
    .email("must be a valid email address")
    .min(1, "email is required"),
  password: z.string().min(1, "password is required"),
  phone: z
    .string()
    .min(9, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
});

export type ShopAttendantForm = z.infer<typeof shopAttendantSchema>;

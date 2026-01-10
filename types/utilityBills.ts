// schemas/airtime.ts
import { z } from "zod";

export const airtimeSchema = z.object({
  utilityType: z.enum(["airtime", "data"]),
  phoneNumber: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(11, "Phone number must be exactly 11 digits")
    .regex(/^0[789][01]\d{8}$/, "Invalid Nigerian phone number format"),
  network: z.string().min(1, "Network provider is required"), 
  amount: z
    .number()
    .min(100, "Amount must be at least ₦100")
    .max(100000, "Amount cannot exceed ₦100,000"),
  pin: z.string().length(4, "PIN must be 4 digits"),
});



export const DataSchema = z.object({
  utilityType: z.literal("data"),
  phoneNumber: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(11, "Phone number must be exactly 11 digits")
    .regex(/^0[789][01]\d{8}$/, "Invalid Nigerian phone number format"),
  network: z.string().min(1, "Network provider is required"), 
  dataBundle: z.object({
    size: z.string(),
    validity: z.string(),
    price: z.number(),
  }),
  pin: z.string().length(4, "PIN must be 4 digits"),
});

export type DataFormData = z.infer<typeof DataSchema>;
export type AirtimeFormData = z.infer<typeof airtimeSchema>;


// Correct request payload
export type BuyAirtimePayload = {
  phoneNumber: string;
  amount: number | string;
  pinToken: string;
  idempotencyKey: string;
  deviceFingerprint?: string;
  ipAddress?: string;
};

// Correct full response (success + error cases)
export type BuyAirtimeResponse = {
  status: "success" | "failed";
  msg: string;
  data: any | null; // can be detailed object on success, null on error
};

export type DataPlanItem = {
  productId: string;
  dataBundle: string;
  amount: string;
  validity: string;
};

// Server action response
export type FetchDataPlansResult =
  | { success: true; plans: DataPlanItem[] }
  | { success: false; error: string };

  export type BuyDataPayload = {
  phoneNumber: string;
  productId: string;
  amount: string;
  network: string;
  pinToken: string;
  idempotencyKey: string;
  deviceFingerprint?: string;
  ipAddress?: string;
};

export type BuyDataResponse = {
  status: "success" | "failed";
  msg: string;
  data: any | null;
};
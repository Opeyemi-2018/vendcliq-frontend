// schemas/airtime.ts
import { z } from "zod";

export const airtimeSchema = z.object({
  utilityType: z.enum(["airtime", "data"]),
  phoneNumber: z.string().min(11, "Phone number must be at least 11 digits"),
  network: z.enum(["mtn", "airtel", "glo", "9mobile"]),
  amount: z.number().min(100).max(100000),
  pin: z.string().length(4, "PIN must be 4 digits"),
});

export const dataPlanTypes = [
  "Daily",
  "Weekly",
  "Monthly",
  "XtraValue",
  "Broadband",
] as const;

export const DataSchema = z.object({
  utilityType: z.literal("data"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  network: z.enum(["mtn", "airtel", "glo", "9mobile"]),
  dataBundle: z.object({
    
    size: z.string(),
    validity: z.string(),
    price: z.number(),
    
  }),
  pin: z.string().length(4, "PIN must be 4 digits"),
});

export type AirtimeFormData = z.infer<typeof airtimeSchema>;
export type DataFormData = z.infer<typeof DataSchema>;

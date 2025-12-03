import { z } from "zod";

export const transferSchema = z.object({
  beneficiaryType: z.enum(["saved", "new"]),
  savedBeneficiaryIndex: z.number().optional(),
  bank: z.string().min(1, "Please select a bank"),
  accountNumber: z
    .string()
    .regex(/^\d+$/, "Account number must contain only digits")
    .length(10, "Account number must be exactly 10 digits"),
  accountName: z.string().min(1, "Account name is required"),
  amount: z.coerce
    .number()
    .min(100, "Minimum transfer is ₦100"),
  narration: z.string().optional(),
  pin: z
    .string()
    .regex(/^\d{4}$/, "PIN must be exactly 4 digits")
    .length(4, "Enter your 4-digit PIN"),
});

export type TransferFormData = z.infer<typeof transferSchema>;
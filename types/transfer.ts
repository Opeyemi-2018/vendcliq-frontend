/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

export interface PinValidatePayload {
  pin: string;
}

export interface PinValidateResponse {
  status: string;
  msg: string;
  data: {
    validated: boolean;
    pinToken: string;
    pinTokenExpiresAt: string;
  };
}

export interface VendCliqTransferPayload {
  transactionKey: string;
  amount: number;
  beneficiaryAccountNumber: string;
  beneficiaryAccountName: string;
  beneficiaryProvider: string;
  narration: string;
  sourceAccountNumber: string;
  pinToken: string;
  deviceFingerprint: string;
  ipAddress: string;
}

export interface VendCliqTransferResponse {
  status: string;
  msg: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}
export const transferSchema = z.object({
  beneficiaryType: z.enum(["saved", "new"]),
  savedBeneficiaryIndex: z.number().optional(),
  bank: z
    .string()
    .min(1, "Please select a bank")
    .refine((val) => isNaN(Number(val)), "Bank name cannot be a number"),
  accountNumber: z
    .string()
    .regex(/^\d+$/, "Account number must contain only digits")
    .length(10, "Account number must be exactly 10 digits"),
  accountName: z.string().min(1, "Account name is required"),
  amount: z.coerce.number().min(100, "Minimum transfer is ₦100"),
  narration: z.string().min(1, "Naration is required"),
  pin: z
    .string()
    .regex(/^\d{4}$/, "PIN must be exactly 4 digits")
    .length(4, "Enter your 4-digit PIN"),
});

export type TransferFormData = z.infer<typeof transferSchema>;

// other bank types

export interface OtherBankTransferPayload {
  transactionKey: string;
  amount: number;
  beneficiaryAccountNumber: string;
  beneficiaryBankCode: string;
  beneficiaryAccountName: string;
  narration: string;
  sourceAccountNumber: string;
  deviceFingerprint: string;
  ipAddress: string;
  pinToken: string;
}

export interface OtherBankTransferResponse {
  status: string;
  msg: string;
  data?: any;
}


// types/beneficiary.ts
export interface CreateBeneficiaryPayload {
  walletId: number;
  name: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
}

export interface BeneficiaryData {
  walletId: number;
  userId: number;
  name: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  id: number;
}

export interface CreateBeneficiaryResponse {
  status: string;
  msg: string;
  data: BeneficiaryData;
}


export interface Beneficiary {
  id: number;
  userId: number;
  walletId: number;
  name: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  email: string | null;
  phoneNumber: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetBeneficiariesResponse {
  status: string;
  msg: string;
  data: {
    beneficiaries: Beneficiary[];
    totalCount: number;
    walletId: number;
    filters: Record<string, unknown>;
  };
}

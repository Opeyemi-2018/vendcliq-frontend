/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CreditOtpPayload {
  otp: string;
  due_date: string;
}

export interface CreditOtpResponse {
  statusCode: number;
  error: string | null;
  data: {
    message: string;
  };
}

export interface RecordCreditPaymentPayload {
  amount: number;
  paymentType: "CASH" | "TRANSFER";
  narration?: string;
}

export interface CreditLedgerResponse {
  statusCode: number;
  error: string | null;
  data: any[];
  pagination: any;
}

export interface RecordCreditPaymentResponse {
  statusCode: number;
  error: string | null;
  data: {
    message: string;
    ledger?: any;
    paymentPayload?: {
      accountNumber: string;
      accountName: string;
      bankName: string;
      bankCode: string;
      paymentReference: string;
      expiresAt: string;
      expectedAmount: number;
    };
  };
}
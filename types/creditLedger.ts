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

export interface CreditLedgerSummaryResponse {
  statusCode: number;
  error: string | null;
  data: {
    total_outstanding: number;
    active_credits: number;
    overdue: number;
    overdue_customers: number;
    due_this_week: number;
    due_this_week_reminders: number;
    recovered_this_month: number;
    recovered_this_month_count: number;
  };
}
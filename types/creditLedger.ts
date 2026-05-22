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
export interface LedgerItem {
  uuid: string;
  invoice: { uuid: string; code: string; total: number };
  customer: { uuid: string; name: string; email: string; phone: string };
  store: { uuid: string; name: string };
  total_amount: number;
  amount_paid: number;
  outstanding: number;
  due_date: string;
  status: string;
  payment_history: any[];
  created_at: string;
  updated_at: string;
}

export interface CreditLedgerResponse {
  statusCode: number;
  error: string | null;
  data: LedgerItem[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalCount: number;
    limit: number;
    nextPage: number | null;
  };
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

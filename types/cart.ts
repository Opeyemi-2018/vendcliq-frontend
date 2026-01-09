/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CreateCartPayload {
  offer_id?: string;    
  stock_id?: string;    
  quantity: number;
  delivery: boolean;
  attributes: {
    latitude: number;
    longitude: number;
    address: string;
    storeId: string;
  };
}

export interface CreateCartResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}


export interface PayInvoicePayload {
  paymentType: "WALLET" | "TRANSFER";
  transactionPin?: string;
  narration?: string;
  terminal_id?: string;
}

export interface PayInvoiceResponse {
  statusCode: number;
  error: string | null;
  data: {
    message: string;
    type: string;
    invoiceId: string;
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
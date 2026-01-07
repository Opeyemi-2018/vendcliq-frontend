export interface CreatePurchaseInvoicePayload {
  supplier_id?: string;
  customer_id?: string | null;
  store_id: string;
  items: Array<{
    stock_id: string;
    quantity: number;
    mode: "PACKS" | "PIECES";
    discounted_amount: number;
    empties?: {
      type: "CREDIT" | "SELL";
      quantity: number;
    };
  }>;
}

export interface CreateInvoiceResponse {
  statusCode: number;
  error?: string;
  msg?: string;
  data?: any;
}

export interface CreateInvoicePayload {
  customer_id: string | null;
  store_id: string;
  items: Array<{
    stock_id: string ;
    quantity: number;
    delivery: boolean;
    mode: "PACKS" | "PIECES";
    discounted_amount: number;
    empties?: {
      type: "CREDIT" | "SELL";
      quantity: number;
    };
    attributes?: {
      address?: string;
      latitude?: number;
      longitude?: number;
    };
  }>;
}

export interface CreateInvoiceResponse {
  statusCode: number;
  error?: string;
  msg?: string;
  data?: any;
}

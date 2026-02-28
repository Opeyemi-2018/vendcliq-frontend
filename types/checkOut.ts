// @/types/checkout.ts
export interface CheckoutItem {
  id: string;
  quantity: string;
  cost: number;
  sub_total: number;
  // ... other fields as needed
}

export interface CheckoutResponse {
  statusCode: number;
  error: string | null;
  data: {
    id: string; // invoice ID
    total: number;
    items_count: number;
    items: CheckoutItem[];
    // ... other fields
  };
}

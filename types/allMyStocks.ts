// Add to your apiHelper.ts

export interface UserStocksResponse {
  statusCode: number;
  error: string | null;
  data: Array<{
    id: string;
    sku: string;
    cost_price: string;
    selling_price: string;
    selling_price_pieces: string;
    empties_price: string;
    exp_date: string;
    quantity: string;
    empties_qty: string;
    total_qty: string;
    stock_alert_no: number;
    stock_value: string;
    status: string;
    product: {
      id: string;
      name: string;
      items_per_pack: number;
      image?: string;
    };
    store: {
      id: string;
      name: string;
      address: {
        lat: number;
        lng: number;
        name: string;
      };
    };
    attributes: {
      type: string;
      batch: string;
      supplier: string;
    };
    created_at: string;
    updated_at: string;
  }>;
  pagination: {
    totalPages: number;
    currentPage: number;
    totalCount: number;
    limit: number;
    nextPage: number | null;
  };
}

// Simple type for stock in component
export interface SimpleStock {
  id: string;
  name: string;
  image?: string;
  quantity_available?: number;
  product?: {
    name: string;
    image?: string;
  };
  store?: {
    name: string;
  };
}
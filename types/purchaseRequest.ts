/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PurchaseRequestItem {
  id: string;

  stock_id: number;
  product_id: number;
  invoice_id: string | null;

  quantity: number;
  delivery: boolean;

  cost: number;
  discounted_amount: number;
  sub_total: number;

  empties: any | null;

  attributes: {
    offer: boolean;
    address: string;
    storeId: string;
    latitude: number;
    longitude: number;
    directStock: boolean;
  };

  mode: string;

  otp_codes: {
    driver_otp: string;
    customer_otp: string;
  };

  profit: number;

  created_at: string;
  updated_at: string;

  product: {
    id: string;
    name: string;
    image: string;
  } | null;

  stock: {
    id: string;
    sku: string;
    qty: string;
    price: number;
  } | null;
}


export interface PurchaseRequest {
  id: string;
  code: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;

  user_id?: number; 
  customer_id: number | null;
  store_id: number | null;
  terminal_id: number | null;

  empties_value?: number; 
  supplier_subtotal?: number; 
  attributes?: any | null; 
  customer?: any | null; 
  store?: any | null; 

  items_count?: number; 
  items: PurchaseRequestItem[]; 
}


export interface PurchaseRequestListResponse {
  statusCode: number;
  error: null | string;
  data: PurchaseRequest[];
  pagination: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    nextPage: number | null;
  };
}


export interface PurchaseRequestDetailResponse {
  statusCode: number;
  error: null | string;
  data: PurchaseRequest; 
}

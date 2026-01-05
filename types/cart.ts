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
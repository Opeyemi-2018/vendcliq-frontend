/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BusinessReportSummary {
  opening_stock_value: number;
  closing_stock_value: number;
  total_invoice_value: number;
  invoice_count: number;
  profit_generated: number;
  stock_value_change: number;
}

export interface StockComparisonItem {
  stock_id: string;
  stock_uuid: string; 
  product_name: string;
  product_image: string;
  store_name: string;
  opening_qty: number;
  opening_value: number;
  closing_qty: number;
  closing_value: number;
  qty_change: number;
  value_change: number;
}

export interface BusinessReportResponse {
  statusCode: number;
  error: null | any;
  data: {
    summary: BusinessReportSummary;
    stock_comparison: StockComparisonItem[];
    date_range: {
      start_date: string;
      end_date: string;
    };
  };
}
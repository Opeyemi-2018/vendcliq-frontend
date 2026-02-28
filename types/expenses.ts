// types/expenses.ts

export interface CreateExpensePayload {
  category: string;
  amount: number;
  date: string;
  description: string;
  store_id: string;
}

export interface CreateExpenseResponse {
  statusCode: number;
  error: string | null;
  data?: Expense;
}

// Updated Expense interface to match API response
export interface Expense {
  id: string;
  user_id: number;
  store_id: string;
  store: {
    id: string;
    name: string;
    phone: string;
    address: {
      lat: number;
      lng: number;
      name: string;
    };
  };
  date: string;
  category: string;
  amount: number;
  description: string;
  created_at: string;
  updated_at: string;
}

// Add this new interface for get expenses response
export interface GetExpensesResponse {
  statusCode: number;
  error: string | null;
  data: Expense[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalCount: number;
    limit: number;
    nextPage: number | null;
  };
}

// If you want a generic API response type (optional)
export interface ApiResponse<T = any> {
  statusCode: number;
  error: string | null;
  data?: T;
  message?: string;
}
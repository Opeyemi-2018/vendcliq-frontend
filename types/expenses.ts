// types/expense.ts

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
  data?: {
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
  };
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  store_id: string;
  created_at: string;
}




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

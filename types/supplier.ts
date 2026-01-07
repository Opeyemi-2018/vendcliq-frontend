export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  state: string | null;
  address: string;
  type: string;
  logo?: string | null;
  wallet: {
    bank_name: string;
    email: string;
    account_number: string;
    currency: string;
    account_name?: string;
  };
}

interface GetSuppliersSuccess {
  success: true;
  data: Supplier[];
}

interface GetSuppliersError {
  success: false;
  error: string;
}

export type GetSuppliersResponse = GetSuppliersSuccess | GetSuppliersError;
// types/transactions.ts

export interface TransactionParty {
  kind: "USER" | "EXTERNAL" | "SYSTEM";
  name: string | null;
  accountNumber: string | null;
  bankName: string | null;
  bankCode: string | null;
}

export interface Transaction {
  id: string;
  reference: string;
  direction: "CREDIT" | "DEBIT";
  userRole: "SENDER" | "RECEIVER";
  status: "SUCCESS" | "PENDING" | "FAILED";
  amount: number;
  currency: string;
  fee: number;
  coin: number;
  sender: TransactionParty;
  receiver: TransactionParty;
  category: "TRANSFER" | "INVENTORY_PAYMENT" | "LOGISTICS" | string;
  narration: string;
  sessionId: string | null;
  transactionReference: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    items: Transaction[];
    pagination: {
      total: number;
      page: number;
      perPage: number;
      totalPages: number;
    };
  };
}

export interface TransactionByIdResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: Transaction;
}
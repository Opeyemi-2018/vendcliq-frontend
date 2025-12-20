// types/transactions.ts

export interface TransactionHistoryResponse {
  status: string;
  msg: string;
  data: {
    data: Array<{
      id: number;
      walletId: number;
      amount: string;
      transactionType: "CREDIT" | "DEBIT";
      status: string;
      provider: string;
      sessionId: string;
      fee: string | null;
      customerAccount: {
        Bank: string;
        Name: string;
        BankCode: string;
        AccountNumber: string;
      };
      beneficiaryAccount: {
        Bank: string;
        Name: string;
        BankCode: string;
        AccountNumber: string;
      } | null;
      senderAccount: {
        Bank: string;
        Name: string;
        BankCode: string;
        AccountNumber: string;
      } | null;
      description: string;
      transactionReference: string;
      createdAt: string;
      updatedAt: string;
      transactionKey: string | null;
    }>;
  };
}

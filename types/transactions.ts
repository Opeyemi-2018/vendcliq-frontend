/* eslint-disable @typescript-eslint/no-explicit-any */
// types/transactions.ts

export interface TransactionHistoryResponse {
  status: string;
  msg: string;
  data: {
    data: Array<{
      id: number;
      walletId: number;
      amount: string;
      transactionType: "CREDIT" | "TRANSFER";
      status: string;
      provider: string;
      sessionId: string | null;
      fee: string | null;
      rawProviderPayload: Record<string, any>;

      customerAccount: any;
      senderAccount: {
        Bank?: string;
        Name?: string;
        BankCode?: string;
        AccountNumber?: string;
        name?: string;
        accountNumber?: string;
      } | null;

      beneficiaryAccount: {
        name: string;
        provider: string;
        accountNumber: string;
      } | null;

      description: string;
      transactionReference: string;
      createdAt: string;
      updatedAt: string;
      transactionKey: string | null;
    }>;
    meta: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      firstPage?: number;
      firstPageUrl?: string;
      lastPageUrl?: string;
      nextPageUrl?: string | null;
      previousPageUrl?: string | null;
    };
  };
}

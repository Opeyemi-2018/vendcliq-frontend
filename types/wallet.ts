// types/wallet.ts or your wallet types file
export interface CreateWalletResponse {
  status: string;
  msg: string;
  data: {
    account: {
      accountNumber: string;
      accountType: string;
      accountName: string;
      customerPhone: string;
      customerId: string;
      status: string;
      amount: number | null;
      balance: number;
      accountPrefix: string;
      currency: string;
      isActive: boolean;
      metadata: {
        purpose: string;
        description: string;
        generatedAt: string;
        phoneUsedForGeneration: string;
      };
      createdAt: string;
      updatedAt: string;
    };
    walletId: number;
  };
}
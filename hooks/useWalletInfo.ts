/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useWallet.ts
"use client";

import { useState, useCallback } from "react";
import { handleGetWallet } from "@/lib/utils/api/apiHelper";
import { toast } from "sonner";

export interface WalletData {
  walletId: number;
  balance: string;
  currency: string;
  accountName: string;
  accountNumbers: {
    WEMA?: string;
    [key: string]: string | undefined;
  };
  lastUpdated: string;
}

interface UseWalletReturn {
  wallet: WalletData | null;
  isLoading: boolean;
  error: string | null;
  fetchWallet: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  getBalance: () => string;
  getAccountNumber: (bank?: string) => string;
}

export const useWallet = (): UseWalletReturn => {
  const [wallet, setWallet] = useState<WalletData | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wallet");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await handleGetWallet();

      if (response.status === "success" && response.data) {
        const walletData: WalletData = {
          walletId: response.data.walletId,
          balance: response.data.balance,
          currency: response.data.currency,
          accountName: response.data.accountName,
          accountNumbers: response.data.accountNumbers || {},
          lastUpdated: response.data.lastUpdated,
        };

        setWallet(walletData);
        localStorage.setItem("wallet", JSON.stringify(walletData));
      } else {
        const errorMsg = response.msg || "Failed to fetch wallet";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to fetch wallet";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Wallet fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    await fetchWallet();
  }, [fetchWallet]);

  const getBalance = useCallback(() => {
    if (!wallet) return "0.00";
    return wallet.balance;
  }, [wallet]);

  const getAccountNumber = useCallback(
    (bank: string = "WEMA") => {
      if (!wallet || !wallet.accountNumbers) return "";
      return wallet.accountNumbers[bank] || "";
    },
    [wallet],
  );

  return {
    wallet,
    isLoading,
    error,
    fetchWallet,
    refreshWallet,
    getBalance,
    getAccountNumber,
  };
};
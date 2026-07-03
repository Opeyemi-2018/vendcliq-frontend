/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useWallet.ts
"use client";

import { useState, useCallback } from "react";
import { handleGetWallet } from "@/lib/utils/api/apiHelper";
import { useRealtimeWallet } from "./webSocket";

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
  setWallet: React.Dispatch<React.SetStateAction<WalletData | null>>;
  isLiveConnected: boolean;
  newTransactions: any[];
  clearNewTransactions: () => void;
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
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [newTransactions, setNewTransactions] = useState<any[]>([]);

  const fetchWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await handleGetWallet();

      if (response.statusCode === 200 && response.data) {
        const walletData: WalletData = {
          walletId: 0,
          balance: String(response.data.balance),
          currency: response.data.currency,
          accountName: response.data.accountName,
          accountNumbers: {
            [response.data.provider]: response.data.accountNumber,
          },
          lastUpdated: response.data.asOf,
        };

        setWallet(walletData);
        localStorage.setItem("wallet", JSON.stringify(walletData));
      }
    } catch (err: any) {
      console.log(err?.message || "Failed to fetch wallet");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useRealtimeWallet({
    onConnected: () => {
      setIsLiveConnected(true);
    },

    onWalletBalanceUpdate: (data) => {
      setWallet((prev) => {
        if (!prev) return prev;
        const updated: WalletData = {
          ...prev,
          balance: String(data.balance),
          currency: data.currency,
          lastUpdated: data.asOf,
        };
        localStorage.setItem("wallet", JSON.stringify(updated));
        return updated;
      });
    },

    onTransferUpdate: (data) => {
      setNewTransactions((prev) => [data, ...prev]);
    },

    onTransferReceived: (data) => {
      setNewTransactions((prev) => [data, ...prev]);
      fetchWallet();
    },

    onPaymentPush: (data) => {
      setNewTransactions((prev) => [data, ...prev]);
      fetchWallet();
    },
  });

  const refreshWallet = useCallback(async () => {
    await fetchWallet();
  }, [fetchWallet]);

  const getBalance = useCallback(() => {
    return wallet?.balance || "0.00";
  }, [wallet]);

  const getAccountNumber = useCallback(
    (bank: string = "WEMA") => {
      return wallet?.accountNumbers?.[bank] || "";
    },
    [wallet],
  );

  const clearNewTransactions = useCallback(() => {
    setNewTransactions([]);
  }, []);

  return {
    wallet,
    isLoading,
    error,
    fetchWallet,
    refreshWallet,
    getBalance,
    getAccountNumber,
    setWallet,
    isLiveConnected,
    newTransactions,
    clearNewTransactions,
  };
};
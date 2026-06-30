/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useWallet.ts
"use client";

import { useState, useCallback } from "react";
import { handleGetWallet } from "@/lib/utils/api/apiHelper";
import { useWebSocketConnection } from "./webSocket";

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
  getWalletViaWS: () => boolean;
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
  const [newTransactions, setNewTransactions] = useState<any[]>([]);

  const handleWebSocketMessage = useCallback(
    (msg: any) => {
      if (
        msg.action === "balanceUpdate" &&
        msg.status === "success" &&
        msg.data
      ) {
        const updatedWallet: WalletData = {
          walletId: msg.data.walletId || wallet?.walletId || 0,
          balance: msg.data.balance?.toString() || "0.00",
          currency: msg.data.currency || "NGN",
          accountName: msg.data.accountName || "",
          accountNumbers: msg.data.accountNumbers || {},
          lastUpdated: msg.data.updatedAt || new Date().toISOString(),
        };

        setWallet(updatedWallet);
        localStorage.setItem("wallet", JSON.stringify(updatedWallet));
      }

      if (msg.action === "getWallet" && msg.status === "success" && msg.data) {
        const walletData: WalletData = {
          walletId: msg.data.walletId || wallet?.walletId || 0,
          balance: msg.data.balance?.toString() || "0.00",
          currency: msg.data.currency || "NGN",
          accountName: msg.data.accountName || "",
          accountNumbers: msg.data.accountNumbers || {},
          lastUpdated: msg.data.lastUpdated || new Date().toISOString(),
        };

        setWallet(walletData);
        localStorage.setItem("wallet", JSON.stringify(walletData));
      }

      if (
        msg.action === "transactionNotification" &&
        msg.status === "success" &&
        msg.data?.transaction
      ) {
        const tx = msg.data.transaction;
        const amount = tx.amount?.toLocaleString() || "0";
        const type = tx.type === "CREDIT" ? "Received" : "Sent";

        setNewTransactions((prev) => [tx, ...prev]);
      }
    },
    [wallet],
  );

  const { isConnected, sendMessage } = useWebSocketConnection(
    handleWebSocketMessage,
  );

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

  const getWalletViaWS = useCallback(() => {
    return sendMessage("getWallet");
  }, [sendMessage]);

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
    isLiveConnected: isConnected,
    getWalletViaWS,
    newTransactions,
    clearNewTransactions,
  };
};

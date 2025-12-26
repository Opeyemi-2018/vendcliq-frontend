// src/context/WebSocketProvider.tsx
"use client";

import { ReactNode, useEffect } from "react";
import useWebSocket from "@/hooks/useWebSocket"; // adjust path
import { useUser } from "@/context/userContext";

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { walletData, transactionsData } = useWebSocket();
  const { setWallet } = useUser();

  // Update wallet in context whenever WebSocket sends new data
  useEffect(() => {
    if (walletData && Object.keys(walletData).length > 0) {
      // The structure from your WS: { action: 'getWallet' | 'balanceUpdate', balance: '...', ... }
      const updatedWallet = {
        walletId: walletData.walletId || walletData.id,
        balance: walletData.balance?.toString() || "0",
        currency: walletData.currency || "NGN",
        accountName: walletData.accountName || "",
        accountNumbers: walletData.accountNumbers || {},
        createdAt: walletData.createdAt || new Date().toISOString(),
        updatedAt: walletData.updatedAt || new Date().toISOString(),
      };

      setWallet(updatedWallet);
    }
  }, [walletData, setWallet]);

  // Optional: handle transactions if needed later
  // useEffect(() => { ... }, [transactionsData]);

  return <>{children}</>;
}
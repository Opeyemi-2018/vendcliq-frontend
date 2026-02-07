/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useWalletWebSocket.ts
"use client";

import { useEffect, useRef, useCallback } from "react";
import { walletWebSocket, WalletWebSocketCallbacks } from "./walletSocket";
import { useUser } from "@/context/userContext";

interface UseWalletWebSocketOptions {
  autoConnect?: boolean;
  onBalanceUpdate?: (balance: string) => void;
  onTransactionReceived?: (transaction: any) => void;
}

export function useWalletWebSocket(options: UseWalletWebSocketOptions = {}) {
  const {
    autoConnect = true,
    onBalanceUpdate,
    onTransactionReceived,
  } = options;

  const { setWallet, wallet } = useUser();
  const isConnecting = useRef(false);
  const hasConnected = useRef(false); // Track if we've already connected

  /**
   * Handle balance updates from WebSocket
   */
  const handleBalanceUpdate = useCallback(
    (data: any) => {
      // Update wallet in context
      if (wallet) {
        const updatedWallet = {
          ...wallet,
          balance: String(data.balance),
          updatedAt: data.updatedAt,
        };
        setWallet(updatedWallet);
      }

      // Call custom callback
      onBalanceUpdate?.(String(data.balance));
    },
    [wallet, setWallet, onBalanceUpdate],
  );

  /**
   * Handle transaction notifications from WebSocket
   */
  const handleTransactionNotification = useCallback(
    (data: any) => {
      // Call custom callback
      onTransactionReceived?.(data.transaction);
    },
    [onTransactionReceived],
  );

  /**
   * Handle wallet data received from WebSocket
   */
  const handleWalletData = useCallback(
    (data: any) => {
      if (wallet) {
        const updatedWallet = {
          ...wallet,
          balance: String(data.balance),
          currency: data.currency,
          accountName: data.accountName,
          accountNumbers: data.accountNumbers,
          updatedAt: data.lastUpdated || new Date().toISOString(),
        };
        setWallet(updatedWallet);
      }
    },
    [wallet, setWallet],
  );

  /**
   * Handle WebSocket errors
   */
  const handleError = useCallback((error: any) => {
    // Silently handle errors
    // You can add custom error handling here if needed
  }, []);

  /**
   * Handle connection established
   */
  const handleConnected = useCallback(
    (data: any) => {
      // Connection established silently
    },
    [],
  );

  /**
   * Handle disconnection
   */
  const handleDisconnected = useCallback(
    (code: number, reason: string) => {
      // Disconnection handled silently
    },
    [],
  );

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (isConnecting.current || hasConnected.current) {
      return;
    }

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("authToken");

    if (!token) {
      return;
    }

    if (walletWebSocket.isConnected()) {
      hasConnected.current = true;
      return;
    }

    isConnecting.current = true;

    const callbacks: WalletWebSocketCallbacks = {
      onBalanceUpdate: handleBalanceUpdate,
      onTransactionNotification: handleTransactionNotification,
      onWalletData: handleWalletData,
      onConnected: handleConnected,
      onError: handleError,
      onDisconnected: handleDisconnected,
    };

    walletWebSocket.connect(token, callbacks);
    hasConnected.current = true;

    // Reset connecting flag after a short delay
    setTimeout(() => {
      isConnecting.current = false;
    }, 1000);
  }, [
    handleBalanceUpdate,
    handleTransactionNotification,
    handleWalletData,
    handleConnected,
    handleError,
    handleDisconnected,
  ]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    walletWebSocket.disconnect();
    hasConnected.current = false;
  }, []);

  /**
   * Get wallet data
   */
  const getWallet = useCallback(() => {
    walletWebSocket.getWallet();
  }, []);

  /**
   * Get transactions
   */
  const getTransactions = useCallback((filters?: any) => {
    walletWebSocket.getTransactions(filters);
  }, []);

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect && !hasConnected.current) {
      connect();
    }

    // Cleanup only on final unmount
    return () => {
      // Only disconnect if this is a real unmount, not React Strict Mode
      // We'll let the singleton manage the connection lifecycle
    };
  }, []); // Empty dependency array - only run once

  return {
    connect,
    disconnect,
    getWallet,
    getTransactions,
    isConnected: walletWebSocket.isConnected(),
  };
}
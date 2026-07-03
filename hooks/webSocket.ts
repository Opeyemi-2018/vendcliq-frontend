/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useRealtimeWallet.ts
"use client";

import { useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface TransferUpdatePayload {
  transactionId: string;
  reference: string;
  status: "PROCESSING" | "SUCCESS" | "FAILED" | "REVERSED";
}

export interface TransferReceivedPayload {
  transactionId: string;
  reference: string;
}

export interface PaymentPushPayload {
  reference: string;
  amount: string;
  currency: string;
  channel: string;
  status: string;
}

export interface WalletBalanceUpdatePayload {
  balance: number;
  currency: string;
  asOf: string;
}

export interface RealtimeWalletHandlers {
  onConnected?: (data: { userId: string; timestamp: string }) => void;
  onTransferUpdate?: (data: TransferUpdatePayload) => void;
  onTransferReceived?: (data: TransferReceivedPayload) => void;
  onPaymentPush?: (data: PaymentPushPayload) => void;
  onWalletBalanceUpdate?: (data: WalletBalanceUpdatePayload) => void;
}

// Module-level cache — fetched once per session
let cachedToken: string | null = null;
export const clearTokenCache = () => {
  cachedToken = null;
};

export function useRealtimeWallet(handlers: RealtimeWalletHandlers) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  const isMountedRef = useRef(true);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  const getToken = useCallback(async (): Promise<string | null> => {
    if (cachedToken) return cachedToken;
    try {
      const res = await fetch("/api/auth/ws-token");
      if (!res.ok) return null;
      const { token } = await res.json();
      cachedToken = token;
      return token;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      if (!isMountedRef.current) return;

      const token = await getToken();
      if (!token) return;

      if (socketRef.current?.connected) return;

      const socket = io("wss://vendcliq.cloud", {
        path: "/realtime",
        transports: ["websocket"],
        auth: { token },
        reconnection: false,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("list_events");
      });

      socket.on("connected", (data: { userId: string; timestamp: string }) => {
        if (!isMountedRef.current) return;
        handlersRef.current.onConnected?.(data);
      });

      socket.on("transfer.update", (data: TransferUpdatePayload) => {
        if (!isMountedRef.current) return;
        handlersRef.current.onTransferUpdate?.(data);
      });

      socket.on("transfer.received", (data: TransferReceivedPayload) => {
        if (!isMountedRef.current) return;
        handlersRef.current.onTransferReceived?.(data);
      });

      socket.on("payment.push", (data: PaymentPushPayload) => {
        if (!isMountedRef.current) return;
        handlersRef.current.onPaymentPush?.(data);
      });

      socket.on("wallet.balance.update", (data: WalletBalanceUpdatePayload) => {
        if (!isMountedRef.current) return;
        handlersRef.current.onWalletBalanceUpdate?.(data);
      });

      socket.on("disconnect", (reason: string) => {
        if (!isMountedRef.current) return;
        if (reason !== "io client disconnect") {
          reconnectTimer = setTimeout(() => {
            if (isMountedRef.current) connect();
          }, 5000);
        }
      });
    };

    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [getToken]);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface PaymentUpdatePayload {
  type: "invoice" | "subscription";
  id: string;
  status: "success" | "failed" | "pending";
  amount: number;
  transactionId: string;
  message: string;
}

interface UsePaymentSocketReturn {
  isConnected: boolean;
  subscribeToInvoice: (invoiceId: string) => void;
  unsubscribeFromInvoice: (invoiceId: string) => void;
}

export const usePaymentSocket = (
  onPaymentUpdate?: (data: PaymentUpdatePayload) => void
): UsePaymentSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const verificationKey = process.env.NEXT_PUBLIC_PAYMENT_VERIFICATION_KEY;
    
    if (!verificationKey) {
      console.error("❌ Verification key not found");
      return;
    }

    // Use the WORKING URL
    const socketUrl = "wss://websocket.vendcliq.cloud/payment-notifications";
    
    console.log("🔌 Connecting to payment socket:", socketUrl);

    const socket = io(socketUrl, {
      auth: { key: verificationKey },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      if (!isMountedRef.current) return;
      console.log("✅ Connected to payment notifications");
      setIsConnected(true);
      
      // Resubscribe to all previous invoices on reconnect
      subscriptionsRef.current.forEach((invoiceId) => {
        console.log(`📡 Resubscribing to invoice: ${invoiceId}`);
        socket.emit("subscribe-payment", {
          type: "invoice",
          id: invoiceId
        });
      });
    });

    socket.on("connect_error", (error) => {
      if (!isMountedRef.current) return;
      console.error("❌ Connection error:", error.message);
      setIsConnected(false);
    });

    socket.on("disconnect", (reason) => {
      if (!isMountedRef.current) return;
      console.log("Disconnected from payment notifications:", reason);
      setIsConnected(false);
    });

    socket.on("payment-update", (data: PaymentUpdatePayload) => {
      if (!isMountedRef.current) return;
      console.log("💰 Payment update received:", data);
      onPaymentUpdate?.(data);
    });

    return () => {
      isMountedRef.current = false;
      socket.disconnect();
    };
  }, [onPaymentUpdate]);

  const subscribeToInvoice = (invoiceId: string) => {
    if (socketRef.current?.connected) {
      console.log(`📡 Subscribing to invoice: ${invoiceId}`);
      socketRef.current.emit("subscribe-payment", {
        type: "invoice",
        id: invoiceId
      });
      subscriptionsRef.current.add(invoiceId);
    } else {
      console.warn("⚠️ Socket not connected, saving subscription for later");
      subscriptionsRef.current.add(invoiceId);
    }
  };

  const unsubscribeFromInvoice = (invoiceId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("unsubscribe-payment", {
        type: "invoice",
        id: invoiceId
      });
    }
    subscriptionsRef.current.delete(invoiceId);
  };

  return {
    isConnected,
    subscribeToInvoice,
    unsubscribeFromInvoice
  };
};
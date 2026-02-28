/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useWebSocketConnection.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface WebSocketMessage {
  action: string;
  status: string;
  message: string;
  data?: any;
  error?: any;
}

interface UseWebSocketConnectionReturn {
  isConnected: boolean;
  sendMessage: (action: string, data?: any) => boolean;
}

export const useWebSocketConnection = (
  onMessage: (message: WebSocketMessage) => void
): UseWebSocketConnectionReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    
    const token = localStorage.getItem("accessToken") || 
                  localStorage.getItem("authToken") ||
                  localStorage.getItem("token");
    
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const url = `wss://api.vendcliq.com/wallets?token=${encodeURIComponent(token)}`;
    
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) {
        ws.close();
        return;
      }
      setIsConnected(true);
      ws.send(JSON.stringify({ action: "getWallet" }));
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        onMessage(message);
      } catch (err) {
        console.error("Failed to parse WebSocket message");
      }
    };

    ws.onerror = () => {
      if (!isMountedRef.current) return;
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      if (!isMountedRef.current) return;
      setIsConnected(false);
      
      const normalClosureCodes = [1000, 1001, 1005];
      if (normalClosureCodes.includes(event.code)) {
        return;
      }
      
      if (event.code === 1008) {
        return;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          connect();
        }
      }, 5000);
    };
  }, [onMessage]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();
    
    return () => {
      isMountedRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000, "Component unmounting");
        }
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((action: string, data?: any) => {
    if (!isMountedRef.current) return false;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, data }));
      return true;
    }
    return false;
  }, []);

  return {
    isConnected,
    sendMessage,
  };
};
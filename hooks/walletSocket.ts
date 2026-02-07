/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// services/walletWebSocket.ts
"use client";

export interface WebSocketMessage {
  action: string;
  status: "success" | "failed";
  message: string;
  data?: any;
  error?: any;
}

export interface BalanceUpdateData {
  balance: number | string;
  currency: string;
  transaction?: {
    id: number;
    amount: number;
    type: string;
    description: string;
    timestamp: string;
  };
  updatedAt: string;
}

export interface TransactionNotificationData {
  transaction: {
    id: number;
    amount: number;
    type: string;
    status: string;
    description: string;
    provider: string;
    timestamp: string;
  };
}

export interface WalletWebSocketCallbacks {
  onBalanceUpdate?: (data: BalanceUpdateData) => void;
  onTransactionNotification?: (data: TransactionNotificationData) => void;
  onWalletData?: (data: any) => void;
  onTransactionsData?: (data: any) => void;
  onConnected?: (data: any) => void;
  onError?: (error: any) => void;
  onDisconnected?: (code: number, reason: string) => void;
}

class WalletWebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: WalletWebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // Start with 3 seconds
  private pingInterval: NodeJS.Timeout | null = null;
  private isIntentionalClose = false;
  private token: string | null = null;

  constructor() {
    // Bind methods to preserve 'this' context
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  /**
   * Connect to the WebSocket server
   */
  connect(token: string, callbacks: WalletWebSocketCallbacks = {}) {
    // Don't connect if already connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    this.token = token;
    this.callbacks = callbacks;
    this.isIntentionalClose = false;

    try {
      // Determine the WebSocket URL based on environment
      const wsUrl = this.getWebSocketUrl(token);
      
      console.log("Connecting to WebSocket...");
      this.ws = new WebSocket(wsUrl);

      // Attach event listeners
      this.ws.addEventListener("open", this.handleOpen);
      this.ws.addEventListener("message", this.handleMessage);
      this.ws.addEventListener("error", this.handleError);
      this.ws.addEventListener("close", this.handleClose);
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.callbacks.onError?.(error);
      this.scheduleReconnect();
    }
  }

  /**
   * Get the appropriate WebSocket URL based on environment
   */
  private getWebSocketUrl(token: string): string {
  // Always use production server since backend is deployed
  return `wss://api.vendcliq.com/wallets?token=${token}`;
}

  /**
   * Handle WebSocket connection opened
   */
  private handleOpen(event: Event) {
    console.log("✅ WebSocket connected successfully");
    this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    this.reconnectDelay = 3000; // Reset delay

    // Start ping interval to keep connection alive
    this.startPingInterval();
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      console.log("📨 WebSocket message received:", message);

      // Handle different message types
      switch (message.action) {
        case "connection":
          console.log("Connected as:", message.data);
          this.callbacks.onConnected?.(message.data);
          // Automatically fetch wallet data on connection
          this.getWallet();
          break;

        case "balanceUpdate":
          console.log("💰 Balance updated:", message.data);
          this.callbacks.onBalanceUpdate?.(message.data);
          break;

        case "transactionNotification":
          console.log("🔔 New transaction:", message.data);
          this.callbacks.onTransactionNotification?.(message.data);
          break;

        case "getWallet":
          if (message.status === "success") {
            console.log("Wallet data received:", message.data);
            this.callbacks.onWalletData?.(message.data);
          } else {
            console.error("Failed to get wallet:", message.message);
            this.callbacks.onError?.(message.error);
          }
          break;

        case "getTransactions":
          if (message.status === "success") {
            console.log("Transactions data received");
            this.callbacks.onTransactionsData?.(message.data);
          } else {
            console.error("Failed to get transactions:", message.message);
            this.callbacks.onError?.(message.error);
          }
          break;

        case "pong":
          // Connection is alive
          console.log("💓 Connection alive");
          break;

        default:
          console.warn("Unknown message action:", message.action);
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
      this.callbacks.onError?.(error);
    }
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(event: Event) {
    console.error("❌ WebSocket error:", event);
    this.callbacks.onError?.(event);
  }

  /**
   * Handle WebSocket connection closed
   */
  private handleClose(event: CloseEvent) {
    console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
    
    this.stopPingInterval();
    this.callbacks.onDisconnected?.(event.code, event.reason);

    // Check if it's an authentication error
    if (event.code === 1008) {
      console.error("Authentication failed! Token may be invalid or expired.");
      this.callbacks.onError?.({
        type: "authentication",
        message: "Authentication failed. Please log in again."
      });
      return;
    }

    // Attempt to reconnect if not an intentional close
    if (!this.isIntentionalClose) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached. Giving up.");
      this.callbacks.onError?.({
        type: "reconnect_failed",
        message: "Failed to reconnect after multiple attempts"
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.token && !this.isIntentionalClose) {
        console.log("Reconnecting...");
        this.connect(this.token, this.callbacks);
      }
    }, delay);
  }

  /**
   * Start sending ping messages to keep connection alive
   */
  private startPingInterval() {
    this.stopPingInterval(); // Clear any existing interval

    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ action: "ping" });
      }
    }, 60000); // Ping every 60 seconds
  }

  /**
   * Stop the ping interval
   */
  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  private send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Cannot send message:", message);
    }
  }

  /**
   * Request wallet balance and info
   */
  getWallet() {
    this.send({ action: "getWallet" });
  }

  /**
   * Request transaction history with optional filters
   */
  getTransactions(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    transactionType?: string;
    provider?: string;
    startDate?: string;
    endDate?: string;
  }) {
    this.send({
      action: "getTransactions",
      data: filters || {}
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    console.log("Disconnecting WebSocket...");
    this.isIntentionalClose = true;
    this.stopPingInterval();
    
    if (this.ws) {
      this.ws.close(1000, "Client disconnecting");
      this.ws = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get current connection state
   */
  getState(): number | null {
    return this.ws?.readyState ?? null;
  }
}

// Export a singleton instance
export const walletWebSocket = new WalletWebSocketService();

"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function WSDiagnostic() {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${msg}`, ...prev]);
    console.log(`[WS Diag] ${msg}`);
  };

  useEffect(() => {
    const connect = async () => {
      log("🔑 Fetching token...");
      const res = await fetch("/api/auth/ws-token");
      if (!res.ok) { log("❌ Not authenticated"); setStatus("no-token"); return; }
      const { token } = await res.json();
      log(`✅ Token: ${token.slice(0, 20)}...`);
      setStatus("connecting");

      const socket = io("wss://vendcliq.cloud", {
        path: "/realtime",
        transports: ["websocket"],
        auth: { token: `Bearer ${token}` },
        reconnection: false,
      });

      socketRef.current = socket;

      socket.onAny((eventName: string, ...args: any[]) => {
        log(`📨 SERVER → "${eventName}": ${JSON.stringify(args, null, 2)}`);

        log(`📤 Acknowledging "${eventName}"...`);
        socket.emit(`${eventName}_ack`, { received: true });
      });

      socket.on("connect", () => {
        log(`✅ Connected! id: ${socket.id}`);
        setStatus("connected");

        log('📤 Emitting "list_events"...');
        socket.emit("list_events");
      });

      socket.on("connect_error", (err: Error) => {
        log(`❌ Connect error: ${err.message}`);
        setStatus("error");
      });

      socket.on("disconnect", (reason: string) => {
        log(`🔌 Disconnected: ${reason}`);
        setStatus("disconnected");
      });
    };

    connect();
    return () => { socketRef.current?.disconnect(); };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 w-[520px] max-h-[500px] bg-gray-950 text-green-400 rounded-2xl shadow-2xl z-[9999] flex flex-col text-xs font-mono border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800">
        <span className="font-bold text-white text-sm">WS Diagnostic v6</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          status === "connected" ? "bg-green-800 text-green-300" :
          status === "connecting" ? "bg-yellow-800 text-yellow-300" :
          "bg-red-900 text-red-300"
        }`}>{status}</span>
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
        {logs.length === 0 && <p className="text-gray-600">Starting...</p>}
        {logs.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap break-all leading-relaxed border-b border-gray-900 pb-1">{l}</div>
        ))}
      </div>
    </div>
  );
}
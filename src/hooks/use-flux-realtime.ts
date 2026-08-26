"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface RealtimeState {
  connected: boolean;
  online: number;
  vaultBalance: number | null;
  lastRunAt: string | null;
  lastPulse: string | null;
}

/**
 * Connects to the Flux realtime mini-service (port 3003 via Caddy).
 * Returns live vault balance + connection status so the UI can show
 * an honest "Live" indicator and react to forecast runs / vault changes.
 */
export function useFluxRealtime() {
  const [state, setState] = useState<RealtimeState>({
    connected: false,
    online: 0,
    vaultBalance: null,
    lastRunAt: null,
    lastPulse: null,
  });
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1500,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => setState((s) => ({ ...s, connected: true })));
    socket.on("disconnect", () => setState((s) => ({ ...s, connected: false })));

    socket.on("snapshot", (data: any) => {
      setState((s) => ({ ...s, vaultBalance: data?.vaultBalance ?? null, lastRunAt: data?.lastRunAt ?? null }));
    });

    socket.on("vault-update", (data: any) => {
      setState((s) => ({ ...s, vaultBalance: data?.vaultBalance ?? null }));
    });

    socket.on("forecast-run", (data: any) => {
      setState((s) => ({
        ...s,
        vaultBalance: data?.vaultBalance ?? s.vaultBalance,
        lastRunAt: data?.at ?? null,
      }));
    });

    socket.on("pulse", (data: any) => {
      setState((s) => ({ ...s, online: data?.online ?? 0, lastPulse: data?.at ?? null }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return state;
}

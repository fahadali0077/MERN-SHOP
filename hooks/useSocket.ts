"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { LiveOrder } from "@/lib/mock/adminData";
import { generateMockOrder } from "@/lib/mock/adminData";

/**
 * useSocket — mock Socket.IO client hook.
 *
 * MENTAL MODEL:
 *   In production this connects to a real Socket.IO server:
 *     const socket = io("http://localhost:4000")
 *     socket.on("new_order", handler)
 *
 *   Here we simulate with setInterval — every intervalMs a new order fires,
 *   mimicking socket.on("new_order", handler).
 *
 *   CLEANUP IS CRITICAL:
 *   clearInterval in useEffect cleanup → no interval after unmount.
 *   Without it: setOrders fires on a dead component → React memory leak warning.
 *
 * REAL SOCKET.IO PATTERN (for reference in MERN-III):
 *   useEffect(() => {
 *     const socket = io(SOCKET_URL, { autoConnect: false });
 *     socket.connect();
 *     socket.on("new_order", order => setOrders(prev => [order, ...prev]));
 *     return () => { socket.off("new_order"); socket.disconnect(); };
 *   }, []);
 */

interface UseSocketOptions {
  enabled?: boolean;
  intervalMs?: number;
  maxOrders?: number;
}

interface UseSocketReturn {
  orders: LiveOrder[];
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  clearOrders: () => void;
}

export function useSocket({
  enabled = true,
  intervalMs = 4000,
  maxOrders = 50,
}: UseSocketOptions = {}): UseSocketReturn {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (intervalRef.current) return;
    setConnected(true);
    setTimeout(() => {
      setOrders((prev) => [generateMockOrder(), ...prev].slice(0, maxOrders));
    }, 500);
    intervalRef.current = setInterval(() => {
      setOrders((prev) => [generateMockOrder(), ...prev].slice(0, maxOrders));
    }, intervalMs);
  }, [intervalMs, maxOrders]);

  const disconnect = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setConnected(false);
  }, []);

  const clearOrders = useCallback(() => { setOrders([]); }, []);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => { disconnect(); };
  }, [enabled, connect, disconnect]);

  return { orders, connected, connect, disconnect, clearOrders };
}

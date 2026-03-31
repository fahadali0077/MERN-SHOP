"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { LiveOrder } from "@/lib/mock/adminData";
import { generateMockOrder } from "@/lib/mock/adminData";


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

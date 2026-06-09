"use client";

/**
 * hooks/useSocket.ts
 *
 * FIX #10: the socket no longer connects for every visitor. Callers must pass
 * `enabled` (typically `isAdmin` or "user is authenticated"). It only emits
 * `join:admin` when `asAdmin` is true, and exposes `joinUser(userId)` so customer
 * pages can subscribe to their own order events without joining the admin room.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { io as socketIO, type Socket } from "socket.io-client";

export interface LiveOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
  items: number;
  timestamp: string;
}

interface NewOrderPayload {
  order: {
    _id?: string;
    id?: string;
    user?: { name?: string; email?: string } | string;
    totalAmount: number;
    status: string;
    items: unknown[];
  };
  timestamp: string;
}

function payloadToLiveOrder(payload: NewOrderPayload): LiveOrder {
  const order = payload.order;
  const id = String(order._id ?? order.id ?? Math.random());
  let customer = "Anonymous";
  if (typeof order.user === "object" && order.user !== null) {
    customer = order.user.name ?? order.user.email ?? "Customer";
  } else if (typeof order.user === "string") {
    customer = order.user.slice(-8);
  }
  return {
    id,
    customer,
    amount: order.totalAmount,
    status: order.status ?? "pending",
    items: Array.isArray(order.items) ? order.items.length : 0,
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };
}

interface UseSocketOptions {
  // FIX #10: default OFF. Callers explicitly opt in based on auth/role.
  enabled?: boolean;
  asAdmin?: boolean;
  userId?: string | null;
  maxOrders?: number;
}

interface UseSocketReturn {
  orders: LiveOrder[];
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  clearOrders: () => void;
}

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export function useSocket({
  enabled = false,
  asAdmin = false,
  userId = null,
  maxOrders = 50,
}: UseSocketOptions = {}): UseSocketReturn {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = socketIO(API_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setConnected(true);
      // FIX #10: only join the admin room when explicitly acting as an admin.
      if (asAdmin) socket.emit("join:admin");
      if (userId) socket.emit("join:user", userId);
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => {
      console.warn("[useSocket] Connection error:", err.message);
      setConnected(false);
    });

    if (asAdmin) {
      socket.on("newOrder", (payload: NewOrderPayload) => {
        setOrders((prev) => [payloadToLiveOrder(payload), ...prev].slice(0, maxOrders));
      });
    }

    socketRef.current = socket;
  }, [asAdmin, userId, maxOrders]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, []);

  const clearOrders = useCallback(() => setOrders([]), []);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return { orders, connected, connect, disconnect, clearOrders };
}

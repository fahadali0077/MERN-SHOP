"use client";

/**
 * MERN-III Module 7 — hooks/useSocket.ts
 *
 * Replaces the fake setInterval mock with a real Socket.IO connection
 * to the Express backend. The Admin Dashboard LiveOrderFeed receives
 * genuine "newOrder" events when customers check out.
 *
 * Events emitted by backend:
 *   newOrder         → { order, timestamp }  — to "admin-room"
 *   orderConfirmed   → { orderId, totalAmount } — to "user:<id>"
 *   orderStatusChanged → { orderId, status }  — to "user:<id>"
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { io as socketIO, type Socket } from "socket.io-client";

// ── Types — keep compatible with existing LiveOrderFeed component ─────────────
export interface LiveOrder {
  id:          string;
  customer:    string;
  amount:      number;
  status:      string;
  items:       number;
  timestamp:   string;
}

interface NewOrderPayload {
  order: {
    _id?: string;
    id?:  string;
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
    customer = order.user.slice(-8); // show last 8 chars of userId
  }

  return {
    id,
    customer,
    amount:    order.totalAmount,
    status:    order.status ?? "pending",
    items:     Array.isArray(order.items) ? order.items.length : 0,
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };
}

// ── Hook options ──────────────────────────────────────────────────────────────
interface UseSocketOptions {
  enabled?:  boolean;
  maxOrders?: number;
}

interface UseSocketReturn {
  orders:      LiveOrder[];
  connected:   boolean;
  connect:     () => void;
  disconnect:  () => void;
  clearOrders: () => void;
}

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export function useSocket({
  enabled   = true,
  maxOrders = 50,
}: UseSocketOptions = {}): UseSocketReturn {
  const [orders, setOrders]       = useState<LiveOrder[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef                 = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = socketIO(API_URL, {
      transports:        ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setConnected(true);
      // Join admin room to receive newOrder events
      socket.emit("join:admin");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("[useSocket] Connection error:", err.message);
      setConnected(false);
    });

    // Real order event from backend orderController
    socket.on("newOrder", (payload: NewOrderPayload) => {
      const liveOrder = payloadToLiveOrder(payload);
      setOrders((prev) => [liveOrder, ...prev].slice(0, maxOrders));
    });

    socketRef.current = socket;
  }, [maxOrders]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, []);

  const clearOrders = useCallback(() => {
    setOrders([]);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => { disconnect(); };
  }, [enabled, connect, disconnect]);

  return { orders, connected, connect, disconnect, clearOrders };
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "@/stores/toastStore";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, Package, Zap } from "lucide-react";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem { name?: string; quantity?: number; price?: number; }
interface Order {
  _id: string;
  user?: { name?: string; email?: string } | string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress?: { city?: string; country?: string };
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber/10 dark:text-amber-300 dark:border-amber/20",
  processing: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500/20",
  shipped:    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-500/20",
  delivered:  "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-500/20",
  cancelled:  "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-500/20",
};

const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

function StatusBadge({ status, orderId, token, onUpdated }: {
  status: OrderStatus;
  orderId: string;
  token: string | null;
  onUpdated: (id: string, status: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const update = async (newStatus: OrderStatus) => {
    setLoading(true); setOpen(false);
    try {
      const res = await fetch(`${API_URL}/api/v1/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error ?? "Failed");
      onUpdated(orderId, newStatus);
      toast.success("Status updated", `Order marked as ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status", err instanceof Error ? err.message : "Unknown");
    } finally { setLoading(false); }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize transition-all hover:opacity-80 disabled:opacity-50",
          STATUS_STYLES[status] ?? STATUS_STYLES.pending,
        )}
      >
        {loading ? <Loader2 size={10} className="animate-spin" /> : null}
        {status}
        <span className="text-[9px] opacity-60">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-border bg-white shadow-lg dark:border-dark-border dark:bg-dark-surface">
            {STATUS_FLOW.filter((s) => s !== status).map((s) => (
              <button
                key={s}
                onClick={() => { void update(s); }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold capitalize transition-colors hover:bg-surface-raised dark:hover:bg-dark-surface-2",
                  STATUS_STYLES[s],
                  "bg-transparent border-0",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const { orders: socketOrders, connected } = useSocket({ maxOrders: 20 });
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const hasFetched = useRef(false);

  const fetchOrders = useCallback(async (p = 1) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/orders?page=${p}&limit=15`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (res.status === 401) { setError("Session expired — please sign in again."); return; }
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const json = await res.json() as {
        success: boolean;
        data: Order[];
        pagination: { pages: number; total: number };
      };
      setOrders(json.data);
      setTotalPages(json.pagination.pages);
      setTotal(json.pagination.total);
      setPage(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally { setLoading(false); }
  }, [accessToken]);

  useEffect(() => {
    if (!hydrated || hasFetched.current) return;
    hasFetched.current = true;
    void fetchOrders(1);
  }, [hydrated, fetchOrders]);

  const handleStatusUpdate = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
  };

  const getCustomer = (user: Order["user"]): string => {
    if (!user) return "Guest";
    if (typeof user === "object") return user.name ?? user.email ?? "Customer";
    return "Customer";
  };

  const newOrderIds = new Set(socketOrders.map((o) => o.id));

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink dark:text-white">Orders</h1>
            <span className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
              connected ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-surface-raised text-ink-muted",
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "animate-pulse bg-green-500" : "bg-ink-muted/40")} />
              {connected ? "Live" : "Offline"}
            </span>
            {socketOrders.length > 0 && (
              <span className="rounded-full bg-amber-dim px-2 py-0.5 text-[10px] font-bold text-amber">
                <Zap size={9} className="inline" /> {socketOrders.length} new
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-ink-muted">{total} total orders</p>
        </div>
        <button
          onClick={() => { void fetchOrders(page); }}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink-muted hover:border-amber hover:text-amber disabled:opacity-40 dark:border-dark-border"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface">
        {(loading || !hydrated) && (
          <div className="flex items-center justify-center gap-2 py-20 text-ink-muted">
            <Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading orders…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={() => { void fetchOrders(1); }} className="text-xs font-semibold text-amber underline">Retry</button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <Package size={28} className="text-ink-muted/30" />
            <p className="text-sm text-ink-muted">No orders yet</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-raised/60 dark:border-dark-border dark:bg-dark-surface-2/40">
                  {["Order ID", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const isNew = newOrderIds.has(order._id);
                  return (
                    <tr key={order._id} className={cn(
                      "border-b border-border/50 transition-colors dark:border-dark-border/50",
                      isNew ? "bg-amber-50/60 dark:bg-amber/5" : i % 2 === 1 ? "bg-surface-raised/20 dark:bg-dark-surface-2/10" : "",
                      "hover:bg-surface-raised/40 dark:hover:bg-dark-surface-2/30",
                    )}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {isNew && <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />}
                          <span className="font-mono text-xs font-bold text-ink dark:text-white">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink dark:text-white">{getCustomer(order.user)}</p>
                        {order.shippingAddress?.city && (
                          <p className="text-xs text-ink-muted">{order.shippingAddress.city}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-ink-muted">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-5 py-3.5 font-bold tabular-nums text-ink dark:text-white">${order.totalAmount.toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          status={order.status}
                          orderId={order._id}
                          token={accessToken}
                          onUpdated={handleStatusUpdate}
                        />
                      </td>
                      <td className="px-5 py-3.5 text-xs text-ink-muted">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 dark:border-dark-border">
            <p className="text-xs text-ink-muted">Page {page} of {totalPages} · {total} orders</p>
            <div className="flex items-center gap-2">
              <button onClick={() => { void fetchOrders(page - 1); }} disabled={page <= 1}
                className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted hover:border-amber hover:text-amber disabled:opacity-30 dark:border-dark-border">
                <ChevronLeft size={13} />
              </button>
              <button onClick={() => { void fetchOrders(page + 1); }} disabled={page >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted hover:border-amber hover:text-amber disabled:opacity-30 dark:border-dark-border">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

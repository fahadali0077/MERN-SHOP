"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket, type LiveOrder } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, Package } from "lucide-react";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-700   dark:bg-amber/10  dark:text-amber-300",
  processing: "bg-blue-50  text-blue-700    dark:bg-blue-900/30 dark:text-blue-400",
  shipped:    "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered:  "bg-green-50 text-green-700   dark:bg-green-900/30 dark:text-green-400",
  cancelled:  "bg-red-50   text-red-600     dark:bg-red-900/20  dark:text-red-400",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  return isToday
    ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

interface ApiOrder {
  _id: string;
  user?: { name?: string; email?: string } | string;
  items: unknown[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

function apiOrderToLive(o: ApiOrder): LiveOrder {
  let customer = "Anonymous";
  if (typeof o.user === "object" && o.user !== null) {
    customer = (o.user as { name?: string; email?: string }).name ??
               (o.user as { name?: string; email?: string }).email ?? "Customer";
  }
  return {
    id: o._id,
    customer,
    amount: o.totalAmount,
    status: o.status,
    items:  Array.isArray(o.items) ? o.items.length : 0,
    timestamp: o.createdAt,
  };
}

export function LiveOrderFeed() {
  // ── Wait for Zustand to hydrate before reading token ─────────────────────
  const accessToken   = useAuthStore((s) => s.accessToken);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const { orders: socketOrders, connected } = useSocket({ maxOrders: 50 });

  const [dbOrders, setDbOrders]     = useState<LiveOrder[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasFetched = useRef(false);

  const fetchRecentOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setFetchError(null);
    try {
      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch(`${API_URL}/api/v1/orders`, { headers });

      if (res.status === 401) {
        setFetchError("Session expired — please sign in again.");
        return;
      }
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const json = await res.json() as { success: boolean; data: ApiOrder[] };
      if (!json.success) throw new Error("API returned success: false");
      setDbOrders(json.data.map(apiOrderToLive));
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Only fetch once Zustand has hydrated so the token is actually available
  useEffect(() => {
    if (!hydrated) return;
    if (hasFetched.current) return;
    hasFetched.current = true;
    void fetchRecentOrders();
  }, [hydrated, accessToken]);

  // Merge: socket (live) orders on top, DB orders below — deduplicate by id
  const seen = new Set<string>();
  const merged: LiveOrder[] = [];
  for (const o of [...socketOrders, ...dbOrders]) {
    if (!seen.has(o.id)) { seen.add(o.id); merged.push(o); }
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-lg font-normal text-ink dark:text-white">Live Orders</h2>

          {/* Socket status */}
          <span className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            connected
              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-surface-raised text-ink-muted dark:bg-dark-surface-2",
          )}>
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              connected ? "animate-pulse bg-green-500" : "bg-ink-muted/50",
            )} />
            {connected ? "Live" : "Offline"}
          </span>

          {/* New badge */}
          {socketOrders.length > 0 && (
            <span className="rounded-full bg-amber-dim px-2 py-0.5 text-[10px] font-bold text-amber dark:bg-amber/10">
              +{socketOrders.length} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="tabular-nums">{merged.length} total</span>
          <button
            onClick={() => { void fetchRecentOrders(true); }}
            disabled={refreshing || loading}
            className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-ink-muted transition-colors hover:border-amber hover:text-amber disabled:opacity-40 dark:border-dark-border"
          >
            <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Feed body */}
      <div className="h-80 overflow-y-auto p-3">
        {/* Loading */}
        {(loading || !hydrated) && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-muted">
            <Loader2 size={18} className="animate-spin" />
            <p className="text-xs">Loading orders…</p>
          </div>
        )}

        {/* Error */}
        {hydrated && !loading && fetchError && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Package size={28} className="text-ink-muted/30" />
            <p className="text-sm text-red-500">{fetchError}</p>
            <button
              onClick={() => { void fetchRecentOrders(); }}
              className="text-xs font-semibold text-amber underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {hydrated && !loading && !fetchError && merged.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Package size={28} className="text-ink-muted/30" />
            <p className="text-sm text-ink-muted">No orders yet</p>
            <p className="text-xs text-ink-muted/60">New orders appear here in real time</p>
          </div>
        )}

        {/* Order list */}
        {hydrated && !loading && !fetchError && (
          <AnimatePresence initial={false}>
            {merged.map((order, idx) => {
              const isNew = socketOrders.some((s) => s.id === order.id);
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: -14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: idx < 8 ? idx * 0.03 : 0 }}
                  className={cn(
                    "mb-2 flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    isNew
                      ? "border-amber/40 bg-amber-dim dark:border-amber/20 dark:bg-amber/5"
                      : "border-border/60 bg-surface-raised/40 dark:border-dark-border dark:bg-dark-surface-2/30",
                  )}
                >
                  {isNew && <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-amber" />}

                  <div className="min-w-0 flex-shrink-0">
                    <p className="font-mono text-[11px] font-bold text-ink dark:text-white">
                      #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-ink-muted">{formatDate(order.timestamp)}</p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink dark:text-white">{order.customer}</p>
                    <p className="text-[10px] text-ink-muted">{order.items} item{order.items !== 1 ? "s" : ""}</p>
                  </div>

                  <p className="flex-shrink-0 text-sm font-bold tabular-nums text-ink dark:text-white">
                    ${order.amount.toFixed(2)}
                  </p>

                  <span className={cn(
                    "flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                    STATUS_STYLES[order.status] ?? STATUS_STYLES["pending"],
                  )}>
                    {order.status}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

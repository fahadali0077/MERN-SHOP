"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  pending: "bg-amber-dim text-amber dark:bg-amber/10",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function LiveOrderFeed() {
  const { orders, connected, clearOrders } = useSocket({ intervalMs: 3500 });

  return (
    <div className="rounded-xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-lg font-normal dark:text-white">Live Orders</h2>
          <span className={cn(
            "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
            connected ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-cream text-ink-muted dark:bg-dark-surface-2",
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "animate-pulse bg-green-500" : "bg-ink-muted")} />
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>{orders.length} orders</span>
          {orders.length > 0 && (
            <button onClick={clearOrders} className="text-ink-muted hover:text-red-500">Clear</button>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="h-80 overflow-y-auto p-2">
        {orders.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-ink-muted">Waiting for orders…</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mb-2 flex items-center gap-3 rounded-lg border border-border/50 bg-cream/40 p-3 dark:border-dark-border dark:bg-dark-surface-2"
            >
              {/* Order ID */}
              <div className="flex-shrink-0">
                <p className="font-mono text-xs font-bold text-ink dark:text-white">{order.id}</p>
                <p className="text-[10px] text-ink-muted">{formatTime(order.timestamp)}</p>
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink dark:text-white">{order.customer}</p>
                <p className="truncate text-xs text-ink-muted">{order.product}</p>
              </div>

              {/* Amount */}
              <p className="flex-shrink-0 text-sm font-bold tabular-nums text-ink dark:text-white">
                ${order.amount.toFixed(2)}
              </p>

              {/* Status */}
              <span className={cn(
                "flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                STATUS_STYLES[order.status],
              )}>
                {order.status}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

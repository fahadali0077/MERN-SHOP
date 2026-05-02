"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ChevronRight, ArrowLeft, RefreshCw, ShoppingBag } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

interface OrderItem { product: string; name: string; image?: string; price: number; qty: number; }
interface Order {
  id: string; _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress?: { street: string; city: string; country: string };
}

export default function OrdersPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async (p = 1) => {
    if (!accessToken) { router.push("/auth/login"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/orders/my?page=${p}&limit=8`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 401) {
        setError("Your session has expired. Please sign in again.");
        setLoading(false);
        return;
      }
      const data = await res.json() as { success: boolean; data: Order[]; pagination: { pages: number } };
      if (!data.success) throw new Error("Failed to fetch orders");
      setOrders(data.data);
      setTotalPages(data.pagination.pages);
    } catch {
      const status = err instanceof Response ? err.status : 0;
      if (status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else {
        setError("Failed to load orders. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, router]);

  useEffect(() => { void fetchOrders(page); }, [fetchOrders, page]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/account" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-raised dark:border-dark-border dark:hover:bg-dark-surface-2">
            <ArrowLeft size={16} className="text-ink dark:text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink dark:text-white">My Orders</h1>
            <p className="text-sm text-ink-muted">Track & manage your orders</p>
          </div>
        </div>
        <button onClick={() => { void fetchOrders(page); }} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-raised dark:border-dark-border dark:hover:bg-dark-surface-2">
          <RefreshCw size={14} className="text-ink dark:text-white" /> Refresh
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-raised dark:bg-dark-surface-2" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/30 dark:bg-red-900/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          {error.includes("session") ? (
            <Link href="/auth/login" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
              Sign in again →
            </Link>
          ) : (
            <button onClick={() => { void fetchOrders(page); }} className="mt-3 text-sm font-medium text-primary hover:underline">Retry</button>
          )}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white py-20 dark:border-dark-border dark:bg-dark-surface">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised dark:bg-dark-surface-2">
            <ShoppingBag size={28} className="text-ink-muted" />
          </div>
          <h3 className="font-semibold text-ink dark:text-white">No orders yet</h3>
          <p className="mt-1 text-sm text-ink-muted">Your placed orders will appear here</p>
          <Link href="/products" className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600">
            Browse Products
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id ?? order._id}
              href={`/account/orders/${order.id ?? order._id}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-white p-5 transition-all hover:border-primary/30 hover:shadow-sm dark:border-dark-border dark:bg-dark-surface"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-surface-raised dark:bg-dark-surface-2">
                <Package size={18} className="text-ink-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-ink dark:text-white">
                    #{(order.id ?? order._id).slice(-8).toUpperCase()}
                  </p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[order.status] ?? ""}`}>
                    {order.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-ink dark:text-white">${order.totalAmount.toFixed(2)}</p>
                <ChevronRight size={15} className="ml-auto mt-1 text-ink-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>
            </Link>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40 hover:bg-surface-raised dark:border-dark-border dark:hover:bg-dark-surface-2">
                Previous
              </button>
              <span className="text-sm text-ink-muted">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40 hover:bg-surface-raised dark:border-dark-border dark:hover:bg-dark-surface-2">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, MapPin, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];
const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped:    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const accessToken = useAuthStore((s) => s.accessToken);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) { router.push("/auth/login"); return; }
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/orders/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json() as { success: boolean; data: Order };
        if (!data.success) throw new Error();
        setOrder(data.data);
      } catch {
        setError("Order not found or you don't have access.");
      } finally {
        setLoading(false);
      }
    };
    void fetch_();
  }, [id, accessToken, router]);

  const stepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  if (loading) return (
    <div className="mx-auto max-w-3xl space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-raised dark:bg-dark-surface-2" />)}
    </div>
  );

  if (error || !order) return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/30 dark:bg-red-900/10">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <Link href="/account/orders" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">← Back to Orders</Link>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-raised dark:border-dark-border">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-white">
            Order #{(order.id ?? order._id).slice(-8).toUpperCase()}
          </h1>
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Clock size={11} />
            {new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[order.status] ?? ""}`}>
          {order.status}
        </span>
      </div>

      {/* Progress tracker (not shown for cancelled) */}
      {order.status !== "cancelled" && (
        <div className="rounded-2xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
          <h2 className="mb-5 text-sm font-semibold text-ink dark:text-white">Order Progress</h2>
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-border dark:bg-dark-border" />
            <div
              className="absolute left-0 top-4 h-0.5 bg-primary transition-all"
              style={{ width: stepIndex >= 0 ? `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` : "0%" }}
            />
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="relative flex flex-col items-center gap-2">
                <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                  i <= stepIndex ? "border-primary bg-primary text-white" : "border-border bg-white dark:border-dark-border dark:bg-dark-surface"
                }`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <span className={`text-[11px] capitalize ${i <= stepIndex ? "text-primary font-medium" : "text-ink-muted"}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="rounded-2xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface">
        <div className="border-b border-border px-6 py-4 dark:border-dark-border">
          <h2 className="text-sm font-semibold text-ink dark:text-white">
            {order.items.length} Item{order.items.length !== 1 ? "s" : ""}
          </h2>
        </div>
        {order.items.map((item, i) => (
          <div key={i} className={`flex items-center gap-4 px-6 py-4 ${i !== order.items.length - 1 ? "border-b border-border dark:border-dark-border" : ""}`}>
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface-raised dark:bg-dark-surface-2">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center"><Package size={18} className="text-ink-muted" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink dark:text-white truncate">{item.name}</p>
              <p className="text-xs text-ink-muted">Qty: {item.qty}</p>
            </div>
            <p className="text-sm font-semibold text-ink dark:text-white">${(item.price * item.qty).toFixed(2)}</p>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 dark:border-dark-border">
          <span className="text-sm font-semibold text-ink dark:text-white">Total</span>
          <span className="text-lg font-bold text-ink dark:text-white">${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="rounded-2xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={15} className="text-primary" />
            <h2 className="text-sm font-semibold text-ink dark:text-white">Shipping Address</h2>
          </div>
          <p className="text-sm text-ink-muted">
            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.country}
          </p>
        </div>
      )}
    </div>
  );
}

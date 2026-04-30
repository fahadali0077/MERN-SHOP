"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

interface StatData {
  id:      string;
  label:   string;
  value:   string;
  delta:   string;
  trend:   "up" | "down" | "neutral";
  loading: boolean;
}

const CARD_CONFIG: Record<string, {
  icon:       React.ElementType;
  border:     string;
  iconBg:     string;
  iconColor:  string;
  valueCls:   string;
}> = {
  revenue: {
    icon:      DollarSign,
    border:    "border-t-blue-500",
    iconBg:    "bg-blue-500/10",
    iconColor: "text-blue-400",
    valueCls:  "text-blue-400",
  },
  orders: {
    icon:      ShoppingCart,
    border:    "border-t-violet-500",
    iconBg:    "bg-violet-500/10",
    iconColor: "text-violet-400",
    valueCls:  "text-violet-400",
  },
  users: {
    icon:      Users,
    border:    "border-t-emerald-500",
    iconBg:    "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    valueCls:  "text-emerald-400",
  },
  products: {
    icon:      Package,
    border:    "border-t-amber-500",
    iconBg:    "bg-amber-500/10",
    iconColor: "text-amber-400",
    valueCls:  "text-amber-400",
  },
};

const DEFAULT_STATS: StatData[] = [
  { id: "revenue",  label: "Total Revenue",  value: "—", delta: "from orders", trend: "up",     loading: true },
  { id: "orders",   label: "Orders",         value: "—", delta: "all time",    trend: "up",     loading: true },
  { id: "users",    label: "Registered Users", value: "—", delta: "accounts", trend: "up",     loading: true },
  { id: "products", label: "Products",       value: "—", delta: "in catalogue", trend: "neutral", loading: true },
];

export function StatCards() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const [stats, setStats] = useState<StatData[]>(DEFAULT_STATS);

  useEffect(() => {
    if (!hydrated) return;

    const fetchStats = async () => {
      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const [ordersRes, usersRes, productsRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/v1/orders/stats`,    { headers }),
        fetch(`${API_URL}/api/v1/users?limit=1`,   { headers }),
        fetch(`${API_URL}/api/v1/products?limit=1`),
      ]);

      setStats((prev) => {
        const next = [...prev];

        // ── Revenue + Orders ─────────────────────────────────────────────────
        if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
          ordersRes.value.json().then((data: {
            success: boolean;
            data: { totalRevenue: number; totalOrders: number; recentOrders: number };
          }) => {
            if (!data.success) return;
            setStats((s) => s.map((card) => {
              if (card.id === "revenue") return {
                ...card,
                value:   `$${data.data.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                delta:   "from all orders",
                trend:   "up" as const,
                loading: false,
              };
              if (card.id === "orders") return {
                ...card,
                value:   data.data.totalOrders.toLocaleString(),
                delta:   `${data.data.recentOrders} this month`,
                trend:   "up" as const,
                loading: false,
              };
              return card;
            }));
          }).catch(() => {
            setStats((s) => s.map((c) =>
              c.id === "revenue" || c.id === "orders"
                ? { ...c, value: "N/A", loading: false }
                : c
            ));
          });
        } else {
          setStats((s) => s.map((c) =>
            c.id === "revenue" || c.id === "orders"
              ? { ...c, value: "N/A", loading: false }
              : c
          ));
        }

        // ── Users ─────────────────────────────────────────────────────────────
        if (usersRes.status === "fulfilled" && usersRes.value.ok) {
          usersRes.value.json().then((data: {
            success: boolean;
            pagination: { total: number };
          }) => {
            if (!data.success) return;
            setStats((s) => s.map((c) =>
              c.id === "users"
                ? { ...c, value: data.pagination.total.toLocaleString(), delta: "registered accounts", trend: "up" as const, loading: false }
                : c
            ));
          }).catch(() => {
            setStats((s) => s.map((c) => c.id === "users" ? { ...c, value: "N/A", loading: false } : c));
          });
        } else {
          setStats((s) => s.map((c) => c.id === "users" ? { ...c, value: "N/A", loading: false } : c));
        }

        // ── Products ──────────────────────────────────────────────────────────
        if (productsRes.status === "fulfilled" && productsRes.value.ok) {
          productsRes.value.json().then((data: {
            success: boolean;
            pagination: { total: number };
          }) => {
            if (!data.success) return;
            setStats((s) => s.map((c) =>
              c.id === "products"
                ? { ...c, value: String(data.pagination.total), delta: "in catalogue", trend: "neutral" as const, loading: false }
                : c
            ));
          }).catch(() => {
            setStats((s) => s.map((c) => c.id === "products" ? { ...c, value: "N/A", loading: false } : c));
          });
        } else {
          setStats((s) => s.map((c) => c.id === "products" ? { ...c, value: "N/A", loading: false } : c));
        }

        return next;
      });
    };

    void fetchStats();
  }, [hydrated, accessToken]);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const cfg = CARD_CONFIG[stat.id] ?? CARD_CONFIG.products;
        const Icon = cfg.icon;

        return (
          <div
            key={stat.id}
            className={cn(
              // ── base — dark-mode safe: no bg-white ──────────────────────────
              "group relative overflow-hidden rounded-xl p-5",
              "border border-white/[0.06] bg-dark-surface",
              "shadow-sm transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-xl hover:border-white/10",
              // top accent bar
              "border-t-[3px]",
              cfg.border,
            )}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {/* Subtle glow on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "radial-gradient(ellipse at top left, rgba(255,255,255,0.03) 0%, transparent 70%)" }}
            />

            <div className="relative">
              {/* Top row */}
              <div className="mb-4 flex items-start justify-between">
                {/* Delta badge */}
                <span className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  stat.trend === "up"
                    ? "bg-green-500/10 text-green-400"
                    : stat.trend === "down"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-white/5 text-white/40",
                )}>
                  {stat.trend === "up" && <TrendingUp size={9} strokeWidth={2.5} />}
                  {stat.loading ? "…" : stat.delta}
                </span>

                {/* Icon */}
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  cfg.iconBg,
                )}>
                  {stat.loading
                    ? <Loader2 size={16} className="animate-spin text-white/30" />
                    : <Icon size={16} className={cfg.iconColor} strokeWidth={2} />
                  }
                </div>
              </div>

              {/* Value */}
              <p className={cn(
                "text-3xl font-bold tabular-nums tracking-tight",
                stat.loading ? "text-white/20" : cfg.valueCls,
              )}>
                {stat.loading ? "——" : stat.value}
              </p>

              {/* Label */}
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-white/40">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

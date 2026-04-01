"use client";

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_STATS } from "@/lib/mock/adminData";

const ICONS = {
  revenue: DollarSign,
  orders: ShoppingCart,
  users: Users,
  stock: AlertTriangle,
};

const ACCENT: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  revenue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-t-blue-500", iconBg: "bg-blue-100" },
  orders: { bg: "bg-violet-50", text: "text-violet-600", border: "border-t-violet-500", iconBg: "bg-violet-100" },
  users: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-t-emerald-500", iconBg: "bg-emerald-100" },
  stock: { bg: "bg-red-50", text: "text-red-600", border: "border-t-red-500", iconBg: "bg-red-100" },
};

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {DASHBOARD_STATS.map((stat, i) => {
        const Icon = ICONS[stat.id as keyof typeof ICONS] ?? Package;
        const isUp = stat.trend === "up";
        const isDown = stat.trend === "down";
        const TrendIcon = isUp ? TrendingUp : TrendingDown;
        const accent = ACCENT[stat.id] ?? ACCENT.revenue;

        return (
          <div
            key={stat.id}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border bg-white p-5",
              "shadow-sm ring-1 ring-black/[0.04] transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-lg hover:ring-black/[0.07]",
              "dark:border-dark-border dark:bg-dark-surface dark:ring-white/[0.04]",
              "border-t-[3px]",
              accent.border,
            )}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {/* Background tint on hover */}
            <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100", accent.bg, "dark:opacity-0")} />

            <div className="relative">
              {/* Top row: trend + icon */}
              <div className="mb-4 flex items-start justify-between">
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                    isUp ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                      isDown ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                        "bg-surface-raised text-ink-muted",
                  )}
                >
                  <TrendIcon size={10} strokeWidth={2.5} />
                  {stat.delta}
                </span>

                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", accent.iconBg, "dark:bg-white/10")}>
                  <Icon size={17} className={cn(accent.text, "dark:text-white/80")} strokeWidth={2} />
                </div>
              </div>

              {/* Value + label */}
              <p className={cn("text-3xl font-bold tabular-nums", accent.text, "dark:text-white")}>
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-ink-muted uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

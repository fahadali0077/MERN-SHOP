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


const TOP_BORDER_COLOR: Record<string, string> = {
  revenue: "#3B82F6",
  orders: "#C47F17",
  users: "#10B981",
  stock: "#EF4444",
};

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {DASHBOARD_STATS.map((stat) => {
        const Icon = ICONS[stat.id as keyof typeof ICONS] ?? Package;
        const isUp = stat.trend === "up";
        const isDown = stat.trend === "down";
        const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : TrendingUp;
        const borderClr = TOP_BORDER_COLOR[stat.id] ?? "#C47F17";

        return (
          <div
            key={stat.id}
            className="group relative overflow-hidden rounded-xl border border-border bg-white p-5 shadow-sm ring-1 ring-black/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-dark-border dark:bg-dark-surface dark:ring-white/[0.04]"
            style={{ borderTop: `3px solid ${borderClr}` }}
          >
            {/* Icon top-right */}
            <div className="mb-4 flex items-start justify-between">
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                  isUp ? "bg-green-50  text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                    isDown ? "bg-red-50    text-red-600   dark:bg-red-900/20   dark:text-red-400" :
                      "bg-cream     text-ink-muted dark:bg-dark-surface-2",
                )}
              >
                <TrendIcon size={10} strokeWidth={2.5} />
                {stat.delta}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-dim dark:bg-amber/10">
                <Icon size={17} className="text-amber" strokeWidth={2} />
              </div>
            </div>

            {/* Value + label */}
            <p className="text-3xl font-bold tabular-nums" style={{ color: "#C47F17" }}>{stat.value}</p>
            <p className="mt-1 text-sm font-medium uppercase tracking-wide text-ink-muted">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}

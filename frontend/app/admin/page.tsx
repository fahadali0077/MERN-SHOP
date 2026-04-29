import Link from "next/link";
import { Package, Users, Zap, ArrowUpRight, TrendingUp, ShoppingCart } from "lucide-react";
import { StatCards } from "@/components/admin/StatCards";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { LiveOrderFeed } from "@/components/admin/LiveOrderFeed";

const QUICK_ACTIONS = [
  {
    href: "/admin/products",
    icon: Package,
    label: "Manage Products",
    sub: "Add, edit or remove items",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "hover:border-violet-200 dark:hover:border-violet-500/30",
  },
  {
    href: "/admin/orders",
    icon: Zap,
    label: "Live Orders",
    sub: "Real-time order stream",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-500/10",
    border: "hover:border-green-200 dark:hover:border-green-500/30",
  },
  {
    href: "/admin/users",
    icon: Users,
    label: "Users",
    sub: "Manage customer accounts",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "hover:border-blue-200 dark:hover:border-blue-500/30",
  },
  {
    href: "/products",
    icon: ShoppingCart,
    label: "View Storefront",
    sub: "See what customers see",
    color: "text-amber dark:text-amber",
    bg: "bg-amber-dim dark:bg-amber/10",
    border: "hover:border-amber/30 dark:hover:border-amber/30",
  },
];

export default function AdminDashboardPage() {
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" :
    now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-ink-muted">{greeting} 👋</p>
          <h1 className="mt-0.5 text-2xl font-bold text-ink dark:text-white">
            Dashboard Overview
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs text-ink-muted dark:border-dark-border dark:bg-dark-surface">
          <TrendingUp size={13} className="text-green-500" />
          <span>All systems operational</span>
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <StatCards />

      {/* ── Quick actions ───────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, sub, color, bg, border }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col gap-3 rounded-xl border border-border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${border} dark:border-dark-border dark:bg-dark-surface`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={18} className={color} strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white leading-tight">{label}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{sub}</p>
              </div>
              <ArrowUpRight
                size={14}
                className="text-ink-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Charts + live feed ──────────────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <RevenueChart />
        <LiveOrderFeed />
      </div>

    </div>
  );
}

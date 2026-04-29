"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShoppingBag, LayoutDashboard, Package, Zap,
  Users, Store, Home, ChevronRight
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV_ITEMS = [
  { href: "/admin",          label: "Dashboard",   icon: LayoutDashboard, exact: true,  badge: null },
  { href: "/admin/products", label: "Products",    icon: Package,         exact: false, badge: null },
  { href: "/admin/orders",   label: "Live Orders", icon: Zap,             exact: false, badge: "Live" },
  { href: "/admin/users",    label: "Users",       icon: Users,           exact: false, badge: null },
];

const STORE_ITEMS = [
  { href: "/",         label: "Home",       icon: Home  },
  { href: "/products", label: "Storefront", icon: Store },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[220px] flex-shrink-0 flex-col border-r border-border bg-white dark:border-dark-border dark:bg-dark-surface">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink dark:bg-amber shadow-sm">
          <ShoppingBag size={15} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-serif text-sm tracking-tight text-ink dark:text-white">
            MERN<span className="text-amber">Shop</span>
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-ink-muted">Admin Panel</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-border dark:bg-dark-border" />

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Admin navigation">
        <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-widest text-ink-muted/60">
          Management
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact, badge }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary-light text-primary font-semibold dark:bg-primary/10 dark:text-primary"
                      : "text-ink-soft hover:bg-surface-raised hover:text-ink dark:text-white/70 dark:hover:bg-dark-surface-2 dark:hover:text-white",
                  )}
                >
                  <Icon
                    size={15}
                    className={cn("flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-ink-muted group-hover:text-ink dark:text-white/40 dark:group-hover:text-white")}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {badge && (
                    <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {badge}
                    </span>
                  )}
                  {isActive && !badge && <ChevronRight size={11} className="opacity-50" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mx-1 my-4 h-px bg-border dark:bg-dark-border" />

        <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-widest text-ink-muted/60">
          Storefront
        </p>
        <ul className="space-y-0.5">
          {STORE_ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft transition-all duration-150 hover:bg-surface-raised hover:text-ink dark:text-white/70 dark:hover:bg-dark-surface-2 dark:hover:text-white"
              >
                <Icon size={15} className="flex-shrink-0 text-ink-muted dark:text-white/40" strokeWidth={2} />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer — theme toggle only (sign out is in header) */}
      <div className="mx-4 h-px bg-border dark:bg-dark-border" />
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-xs text-ink-muted">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}

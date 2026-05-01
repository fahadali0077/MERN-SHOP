"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShoppingBag, LayoutDashboard, Package, Zap,
  Users, Store, Home, ChevronRight, Shield
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuthStore } from "@/stores/authStore";

type Role = "admin" | "customer";

interface NavItem {
  href:    string;
  label:   string;
  icon:    React.ElementType;
  exact:   boolean;
  badge:   string | null;
  roles:   Role[];
  tooltip: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, badge: null,
    roles: ["admin"],
    tooltip: "",
  },
  {
    href: "/admin/products", label: "Products", icon: Package, exact: false, badge: null,
    roles: ["admin"],
    tooltip: "",
  },
  {
    href: "/admin/orders", label: "Live Orders", icon: Zap, exact: false, badge: "Live",
    roles: ["admin"],
    tooltip: "",
  },
  {
    href: "/admin/users", label: "Users", icon: Users, exact: false, badge: null,
    roles: ["admin"],  // moderators can view; the page hides edit/delete actions
    tooltip: "",
  },
];

const STORE_ITEMS = [
  { href: "/",         label: "Home",       icon: Home  },
  { href: "/products", label: "Storefront", icon: Store },
];

// What moderators can and cannot do — shown in the sidebar info block
const MODERATOR_PERMISSIONS = {
  can: [
    "View all orders",
    "Update order status",
    "Edit product details",
    "Delete reviews",
    "View users list",
  ],
  cannot: [
    "Create or delete products",
    "Change user roles",
    "Delete users",
    "View financial stats",
  ],
};

export function AdminSidebar() {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const role     = (user?.role ?? "admin") as Role;
  const isMod    = false; // moderator role removed

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
          <p className="text-[9px] font-semibold uppercase tracking-widest text-ink-muted">
            {isMod ? "Moderator" : "Admin Panel"}
          </p>
        </div>
      </div>

      {/* Moderator role badge */}
      {isMod && (
        <div className="mx-3 mb-1 flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 dark:border-purple-500/20 dark:bg-purple-900/10">
          <Shield size={13} className="flex-shrink-0 text-purple-500" strokeWidth={2} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400">Moderator Access</p>
            <p className="truncate text-[9px] text-purple-500/70">Limited permissions</p>
          </div>
        </div>
      )}

      <div className="mx-4 h-px bg-border dark:bg-dark-border" />

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Admin navigation">
        <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-widest text-ink-muted/60">
          Management
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.filter(item => item.roles.includes(role)).map(({ href, label, icon: Icon, exact, badge }) => {
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
                    className={cn("flex-shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-ink-muted group-hover:text-ink dark:text-white/40 dark:group-hover:text-white"
                    )}
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
              <Link href={href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft transition-all duration-150 hover:bg-surface-raised hover:text-ink dark:text-white/70 dark:hover:bg-dark-surface-2 dark:hover:text-white"
              >
                <Icon size={15} className="flex-shrink-0 text-ink-muted dark:text-white/40" strokeWidth={2} />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Moderator permissions info box */}
        {isMod && (
          <div className="mt-4 rounded-lg border border-border bg-surface-raised/60 p-3 dark:border-dark-border dark:bg-dark-surface-2/40">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-ink-muted">Your Access</p>
            <div className="space-y-1">
              {MODERATOR_PERMISSIONS.can.map((item) => (
                <p key={item} className="flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400">
                  <span className="text-[8px]">✓</span> {item}
                </p>
              ))}
            </div>
            <div className="my-2 h-px bg-border dark:bg-dark-border" />
            <div className="space-y-1">
              {MODERATOR_PERMISSIONS.cannot.map((item) => (
                <p key={item} className="flex items-center gap-1.5 text-[10px] text-ink-muted/60 line-through">
                  <span className="text-[8px] no-underline">✗</span> {item}
                </p>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="mx-4 h-px bg-border dark:bg-dark-border" />
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-xs text-ink-muted">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}

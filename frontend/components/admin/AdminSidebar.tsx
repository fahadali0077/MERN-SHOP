"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShoppingBag, LayoutDashboard, Package, Zap,
  Users, Store, Home, ChevronRight, X,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuthStore } from "@/stores/authStore";

type Role = "admin" | "customer";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact: boolean;
  badge: string | null;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, badge: null, roles: ["admin"] },
  { href: "/admin/products", label: "Products", icon: Package, exact: false, badge: null, roles: ["admin"] },
  { href: "/admin/orders", label: "Live Orders", icon: Zap, exact: false, badge: "Live", roles: ["admin"] },
  { href: "/admin/users", label: "Users", icon: Users, exact: false, badge: null, roles: ["admin"] },
];

const STORE_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Storefront", icon: Store },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? "admin") as Role;

  const SidebarContent = () => (
    <aside className="flex h-full w-[220px] flex-shrink-0 flex-col border-r border-border bg-white dark:border-dark-border dark:bg-dark-surface">

      {/* Logo + mobile close button */}
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink dark:bg-amber shadow-sm">
            <ShoppingBag size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-serif text-sm tracking-tight text-ink dark:text-white">
              MERN<span className="text-amber">Shop</span>
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-ink-muted">
              Admin Panel
            </p>
          </div>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-raised hover:text-ink dark:hover:bg-dark-surface-2 dark:hover:text-white md:hidden"
          aria-label="Close sidebar"
        >
          <X size={15} />
        </button>
      </div>

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
      </nav>

      {/* Footer */}
      <div className="mx-4 h-px bg-border dark:bg-dark-border" />
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-xs text-ink-muted">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop: always-visible sidebar ─────────────────────────────────── */}
      <div className="hidden md:flex">
        <SidebarContent />
      </div>

      {/* ── Mobile: slide-in drawer with backdrop ────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
}
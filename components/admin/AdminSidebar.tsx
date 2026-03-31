"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag, LayoutDashboard, Package, Zap, Users, Store, Home, LogOut, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin",          label: "Dashboard",   icon: LayoutDashboard, exact: true  },
  { href: "/admin/products", label: "Products",    icon: Package,         exact: false },
  { href: "/admin/orders",   label: "Live Orders", icon: Zap,             exact: false },
  { href: "/admin/users",    label: "Users",       icon: Users,           exact: false },
];

const STORE_ITEMS = [
  { href: "/",         label: "Home",       icon: Home  },
  { href: "/products", label: "Storefront", icon: Store },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    document.cookie = "mernshop_admin=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    router.push("/admin/login");
  };

  return (
    <aside className="flex h-full w-[220px] flex-shrink-0 flex-col border-r border-border bg-white dark:border-dark-border dark:bg-dark-surface">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink dark:bg-amber">
          <ShoppingBag size={15} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-serif text-sm tracking-tight text-ink dark:text-white">
            MERN<span className="text-amber">Shop</span>
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-ink-muted">Admin</p>
        </div>
      </div>

      <div className="mx-4 mb-2 h-px bg-border dark:bg-dark-border" />

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Admin navigation">
        <p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-widest text-ink-muted/70">
          Management
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-amber-dim text-amber font-semibold dark:bg-amber/10"
                      : "text-ink-soft hover:bg-amber-50 hover:text-amber-700 dark:text-white/70 dark:hover:bg-amber/10 dark:hover:text-amber",
                  )}
                  style={isActive ? { borderLeft: "3px solid #C47F17", paddingLeft: "calc(0.75rem - 3px)" } : { borderLeft: "3px solid transparent", paddingLeft: "calc(0.75rem - 3px)" }}
                >
                  <Icon size={15} className="flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="flex-1 truncate">{label}</span>
                  {isActive && <ChevronRight size={12} className="opacity-60" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mb-1 mt-5 px-2 text-[9px] font-semibold uppercase tracking-widest text-ink-muted/70">
          Storefront
        </p>
        <ul className="space-y-0.5">
          {STORE_ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft transition-all duration-150 hover:bg-amber-50 hover:text-amber-700 dark:text-white/70 dark:hover:bg-amber/10 dark:hover:text-amber"
              >
                <Icon size={15} className="flex-shrink-0" strokeWidth={2} />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer / logout */}
      <div className="mx-4 mb-2 h-px bg-border dark:bg-dark-border" />
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-all duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <LogOut size={15} strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const BREADCRUMBS: Record<string, { title: string; sub: string }> = {
  "/admin":          { title: "Dashboard",    sub: "Overview and analytics"        },
  "/admin/products": { title: "Products",     sub: "Manage your product catalogue" },
  "/admin/orders":   { title: "Live Orders",  sub: "Real-time order feed"          },
  "/admin/users":    { title: "Users",        sub: "Customer management"           },
};

interface AdminHeaderProps {
  onOpenCommandPalette: () => void;
}

export function AdminHeader({ onOpenCommandPalette }: AdminHeaderProps) {
  const pathname = usePathname();
  const page = BREADCRUMBS[pathname] ?? { title: "Admin", sub: "" };

  return (
    <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-border bg-white px-6 dark:border-dark-border dark:bg-dark-surface">

      {/* Page title */}
      <div>
        <h1 className="font-serif text-lg font-normal leading-tight text-ink dark:text-white">
          {page.title}
        </h1>
        {page.sub && (
          <p className="text-[11px] text-ink-muted">{page.sub}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search / Cmd+K trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 rounded-lg border border-border bg-cream/80 px-3 py-2 text-sm text-ink-muted transition-all hover:border-amber hover:bg-amber-dim hover:text-amber dark:border-dark-border dark:bg-dark-surface-2 dark:hover:border-amber dark:hover:text-amber"
          aria-label="Open command palette (⌘K)"
        >
          <Search size={13} strokeWidth={2} />
          <span className="hidden text-xs sm:inline">Quick search</span>
          <kbd className="hidden rounded border border-border bg-white px-1.5 py-0.5 font-mono text-[10px] text-ink-muted dark:border-dark-border dark:bg-dark-surface sm:block">
            ⌘K
          </kbd>
        </button>

        {/* Notification bell (decorative) */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:border-amber hover:text-amber dark:border-dark-border dark:text-white/60">
          <Bell size={15} strokeWidth={2} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber" />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}

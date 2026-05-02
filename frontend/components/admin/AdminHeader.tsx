"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, LogOut, ChevronRight, Menu } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { adminLogoutAction } from "@/app/actions/auth";
import { toast } from "@/stores/toastStore";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const BREADCRUMBS: Record<string, { title: string; sub: string }> = {
  "/admin": { title: "Dashboard", sub: "Overview & analytics" },
  "/admin/products": { title: "Products", sub: "Manage your product catalogue" },
  "/admin/orders": { title: "Live Orders", sub: "Real-time order feed" },
  "/admin/users": { title: "Users", sub: "Customer management" },
};

function getInitials(name?: string | null) {
  if (!name) return "A";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

interface AdminHeaderProps {
  onOpenCommandPalette: () => void;
  onToggleSidebar: () => void;
}

export function AdminHeader({ onOpenCommandPalette, onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const page = BREADCRUMBS[pathname] ?? { title: "Admin", sub: "" };
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogoutConfirm = async () => {
    setShowLogout(false);
    await adminLogoutAction();
    logout();
    toast.success("Signed out", "See you next time!");
    router.push("/auth/login");
  };

  const segments = pathname.split("/").filter(Boolean);

  return (
    <>
      <ConfirmDialog
        open={showLogout}
        title="Sign out of Admin?"
        description="You'll be redirected to the login page."
        confirmLabel="Sign out"
        cancelLabel="Stay"
        variant="warning"
        onConfirm={() => { void handleLogoutConfirm(); }}
        onCancel={() => setShowLogout(false)}
      />

      <header className="flex h-[60px] flex-shrink-0 items-center gap-3 border-b border-border bg-white px-4 dark:border-dark-border dark:bg-dark-surface md:px-6">

        {/* Hamburger — mobile only */}
        <button
          onClick={onToggleSidebar}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:border-primary/40 hover:text-primary dark:border-dark-border dark:text-white/60 md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={16} strokeWidth={2} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex min-w-0 flex-1 items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          {segments.map((seg, i) => {
            const href = "/" + segments.slice(0, i + 1).join("/");
            const isLast = i === segments.length - 1;
            const label = seg.charAt(0).toUpperCase() + seg.slice(1);
            return (
              <span key={href} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight size={12} className="flex-shrink-0 text-ink-muted/50" />}
                {isLast ? (
                  <span className="truncate font-semibold text-ink dark:text-white">{label}</span>
                ) : (
                  <a href={href} className="flex-shrink-0 text-ink-muted transition-colors hover:text-ink dark:text-white/50 dark:hover:text-white">{label}</a>
                )}
              </span>
            );
          })}
          {page.sub && (
            <span className="hidden items-center gap-1 md:flex flex-shrink-0">
              <span className="mx-1 text-ink-muted/30">·</span>
              <span className="text-xs text-ink-muted">{page.sub}</span>
            </span>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Search / Cmd+K — hidden on smallest screens */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden items-center gap-2.5 rounded-lg border border-border bg-cream/80 px-3 py-2 text-sm text-ink-muted transition-all hover:border-primary hover:bg-primary-light hover:text-primary dark:border-dark-border dark:bg-dark-surface-2 dark:hover:border-primary dark:hover:text-primary sm:flex"
            aria-label="Open command palette (⌘K)"
          >
            <Search size={13} strokeWidth={2} />
            <span className="hidden text-xs lg:inline">Quick search</span>
            <kbd className="hidden rounded border border-border bg-white px-1.5 py-0.5 font-mono text-[10px] text-ink-muted dark:border-dark-border dark:bg-dark-surface lg:block">
              ⌘K
            </kbd>
          </button>

          {/* Search icon only — visible on mobile */}
          <button
            onClick={onOpenCommandPalette}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:border-primary/40 hover:text-primary dark:border-dark-border dark:text-white/60 sm:hidden"
            aria-label="Search"
          >
            <Search size={15} strokeWidth={2} />
          </button>

          {/* Notification bell */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:border-primary/40 hover:text-primary dark:border-dark-border dark:text-white/60">
            <Bell size={15} strokeWidth={2} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber" />
          </button>

          {/* User avatar + sign out */}
          <div className="flex items-center gap-2 border-l border-border pl-2 dark:border-dark-border md:pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white shadow-sm">
              {getInitials(user?.name)}
            </div>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-xs font-semibold text-ink dark:text-white">{user?.name ?? "Admin"}</span>
              <span className="text-[10px] text-ink-muted capitalize">{user?.role ?? "admin"}</span>
            </div>
            <button
              onClick={() => setShowLogout(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
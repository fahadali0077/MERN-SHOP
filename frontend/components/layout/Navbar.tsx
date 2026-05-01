"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, LogOut, Sparkles, ChevronDown,
  User, Package, Heart, LayoutDashboard,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/stores/toastStore";
import { CartButton } from "./CartButton";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";

// ── Customer avatar dropdown ────────────────────────────────────────────────
function CustomerMenu({
  user,
  onSignOut,
}: {
  user: { name: string; email: string; avatarUrl?: string };
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="group flex items-center gap-1.5 rounded-full p-0.5 transition-all hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white shadow-sm">
            {initial}
          </span>
        )}
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={`text-ink-muted transition-transform duration-200 dark:text-white/60 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 origin-top-right rounded-2xl border border-border/60 bg-white shadow-xl dark:border-dark-border/60 dark:bg-dark-surface-2">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3 dark:border-dark-border/40">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink dark:text-white">{user.name}</p>
                <p className="truncate text-[11px] text-ink-muted dark:text-white/50">{user.email}</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              {[
                { href: "/account",         icon: User,    label: "My Account"  },
                { href: "/account/orders",  icon: Package, label: "My Orders"   },
                { href: "/wishlist",        icon: Heart,   label: "Wishlist"    },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface-raised hover:text-ink dark:text-white/70 dark:hover:bg-dark-surface dark:hover:text-white"
                >
                  <Icon size={14} strokeWidth={2} className="shrink-0" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="border-t border-border/40 p-1.5 dark:border-dark-border/40">
              <button
                onClick={() => { setOpen(false); onSignOut(); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:text-white/50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <LogOut size={14} strokeWidth={2} className="shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Admin compact avatar ────────────────────────────────────────────────────
function AdminMenu({
  user,
  onSignOut,
}: {
  user: { name: string; email: string };
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      {/* Admin Dashboard pill */}
      <Link
        href="/admin"
        className="group hidden items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 py-2 text-[13px] font-semibold text-primary transition-all hover:bg-primary hover:text-white dark:bg-primary/20 dark:text-primary dark:hover:bg-primary dark:hover:text-white lg:flex"
      >
        <LayoutDashboard size={13} className="transition-transform group-hover:scale-110" />
        Dashboard
      </Link>

      {/* Avatar button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Admin account menu"
        aria-expanded={open}
        className="group flex items-center gap-1.5 rounded-full p-0.5 transition-all hover:ring-2 hover:ring-amber/50 focus-visible:outline-none"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[13px] font-bold text-white shadow-sm">
          {initial}
        </span>
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={`text-ink-muted transition-transform duration-200 dark:text-white/60 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 origin-top-right rounded-2xl border border-border/60 bg-white shadow-xl dark:border-dark-border/60 dark:bg-dark-surface-2">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3 dark:border-dark-border/40">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink dark:text-white">{user.name}</p>
                <span className="rounded-full bg-amber/10 px-2 py-0.5 text-[10px] font-bold text-amber">Admin</span>
              </div>
            </div>

            <div className="p-1.5">
              {[
                { href: "/admin",          icon: LayoutDashboard, label: "Dashboard"    },
                { href: "/admin/products", icon: Package,          label: "Products"    },
                { href: "/admin/orders",   icon: ShoppingBag,      label: "Orders"      },
                { href: "/admin/users",    icon: User,             label: "Users"       },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface-raised hover:text-ink dark:text-white/70 dark:hover:bg-dark-surface dark:hover:text-white"
                >
                  <Icon size={14} strokeWidth={2} className="shrink-0" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="border-t border-border/40 p-1.5 dark:border-dark-border/40">
              <button
                onClick={() => { setOpen(false); onSignOut(); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut size={14} strokeWidth={2} className="shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Navbar ────────────────────────────────────────────────────────────
export function Navbar() {
  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const isAuth  = useAuthStore((s) => s.isAuthenticated);
  const router  = useRouter();

  const [mounted,          setMounted]          = useState(false);
  const [elevated,         setElevated]         = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setElevated(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wishlistCount = useWishlistStore((s) => s.count());

  const isAdmin    = isAuth && user?.role === "admin";
  const isCustomer = isAuth && user?.role !== "admin";

  const confirmSignOut = () => {
    setShowLogoutDialog(false);
    logout();
    window.dispatchEvent(new Event("storage"));
    toast.success("Signed out", "See you next time!");
    router.push("/");
  };

  return (
    <>
      <ConfirmDialog
        open={showLogoutDialog}
        title="Sign out of MERNShop?"
        description="You will need to sign in again to access your cart and orders."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        variant="warning"
        onConfirm={confirmSignOut}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <header
        className={[
          "sticky top-0 z-50 will-change-transform border-b backdrop-blur-xl transition-all duration-300",
          elevated
            ? "border-border/90 bg-white/92 shadow-md dark:border-dark-border/90 dark:bg-dark-surface/92"
            : "border-border/50 bg-white/80 dark:border-dark-border/50 dark:bg-dark-surface/80",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-screen-xl items-center gap-6 px-4 py-0 md:px-6">

          {/* Logo */}
          <Link
            href={isAdmin ? "/admin" : "/"}
            className="group flex flex-shrink-0 items-center gap-2 py-4"
            aria-label="MERNShop"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/30">
              <ShoppingBag size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-serif text-[1.2rem] font-medium tracking-tight text-ink dark:text-white">
              MERN<span className="text-primary">Shop</span>
            </span>
          </Link>

          {/* Nav links — hide for admin */}
          {!isAdmin && (
            <div className="hidden flex-1 md:flex">
              <NavLinks />
            </div>
          )}

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {mounted && (
              <nav className="hidden items-center gap-2 md:flex" aria-label="Account navigation">

                {/* ── Not logged in ── */}
                {!isAuth && (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth/login"
                      className="rounded-lg px-4 py-2 text-[13px] font-semibold text-ink-soft transition-all hover:text-ink dark:text-white/90 dark:hover:text-white"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md hover:shadow-primary/25 active:scale-[0.97]"
                    >
                      Get Started
                    </Link>
                  </div>
                )}

                {/* ── Admin ── avatar + dashboard link */}
                {isAdmin && user && (
                  <AdminMenu user={user} onSignOut={() => setShowLogoutDialog(true)} />
                )}

                {/* ── Customer ── avatar dropdown */}
                {isCustomer && user && (
                  <CustomerMenu user={user} onSignOut={() => setShowLogoutDialog(true)} />
                )}

              </nav>
            )}

            <div className="mx-1 hidden h-5 w-px bg-border dark:bg-dark-border md:block" />

            {/* Wishlist — customers only */}
            {mounted && isCustomer && (
              <Link
                href="/wishlist"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-all hover:bg-surface-raised hover:text-ink dark:text-white/75 dark:hover:bg-dark-surface-2 dark:hover:text-white"
                aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount} items)` : ""}`}
              >
                <Heart size={18} strokeWidth={2} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <ThemeToggle />

            {/* Cart — customers + guests only */}
            {(!mounted || !isAdmin) && <CartButton />}

            <MobileMenu />
          </div>
        </div>
      </header>
    </>
  );
}

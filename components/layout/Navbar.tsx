"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, LogOut, Heart } from "lucide-react";
import { CartButton } from "./CartButton";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";


export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  // Hydration guard — zustand persist hydrates after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const wishlistCount = useWishlistStore((s) => s.count());

  const handleSignOut = () => {
    logout();
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  return (
    <header
      className="sticky top-0 z-50 will-change-transform border-b border-border/70 backdrop-blur-xl bg-parchment/85 dark:border-dark-border/70 dark:bg-dark-bg/85"
    >
      <div className="mx-auto flex max-w-screen-xl items-center gap-6 px-4 py-0 md:px-6">

        {/* Logo */}
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-2 py-4"
          aria-label="MERNShop — return home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink dark:bg-amber">
            <ShoppingBag size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-serif text-[1.2rem] tracking-tight text-ink dark:text-white">
            MERN<span className="font-medium text-amber">Shop</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden flex-1 md:flex">
          <NavLinks />
        </div>

        {/* Spacer on mobile */}
        <div className="flex-1 md:hidden" />

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Auth links — desktop only */}
          {mounted && (
            <nav className="hidden items-center gap-1.5 md:flex" aria-label="Account navigation">
              {isAuth && user ? (
                <>
                  {/* Admin link — only for admin role */}
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="relative rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-amber transition-colors hover:bg-amber-dim"
                      style={{ borderBottom: "2px solid #C47F17" }}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className="rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-cream hover:text-ink dark:text-white/70 dark:hover:bg-dark-surface-2 dark:hover:text-white"
                  >
                    Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    title="Sign out"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    <LogOut size={14} strokeWidth={2} />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="rounded-lg bg-ink px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-ink-soft active:scale-[0.98] dark:bg-amber dark:text-white dark:hover:bg-amber-600"
                >
                  Sign In
                </Link>
              )}
            </nav>
          )}

          {/* Divider */}
          <div className="mx-1 hidden h-5 w-px bg-border dark:bg-dark-border md:block" />

          {/* Wishlist button with badge */}
          {mounted && (
            <Link
              href="/wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-cream hover:text-ink dark:hover:bg-dark-surface-2 dark:hover:text-white"
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
          <CartButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

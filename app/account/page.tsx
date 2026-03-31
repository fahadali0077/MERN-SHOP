"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, ShoppingBag, Heart, LayoutDashboard, LogOut, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore, type CartState } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

export default function AccountPage() {
  const user          = useAuthStore((s) => s.user);
  const logout        = useAuthStore((s) => s.logout);
  const cartCount     = useCartStore((s: CartState) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.count());
  const router        = useRouter();

  const handleLogout = () => { logout(); router.push("/auth/login"); };

  return (
    <div className="pb-16">
      <div className="mb-10 border-b border-border pb-8 dark:border-dark-border">
        <h1 className="font-serif text-4xl font-normal tracking-tight text-ink dark:text-white md:text-5xl">
          My Account
        </h1>
        <p className="mt-2 text-sm text-ink-muted">Manage your profile, orders, and preferences</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile */}
        <div className="rounded-xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-dim dark:bg-amber/10">
            <User size={20} className="text-amber" strokeWidth={2} />
          </div>
          <p className="font-serif text-xl dark:text-white">{user?.name ?? "Guest"}</p>
          <p className="mt-1 text-sm text-gray-400">{user?.email}</p>
          <span className="mt-3 inline-block rounded-full bg-amber-dim px-3 py-0.5 text-xs font-semibold capitalize text-amber dark:bg-amber/10">
            {user?.role ?? "customer"}
          </span>
          <div className="mt-5 border-t border-border pt-4 dark:border-dark-border">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <LogOut size={14} strokeWidth={2} /> Sign out
            </button>
          </div>
        </div>

        {/* Cart */}
        <Link
          href="/cart"
          className="group rounded-xl border border-border bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <ShoppingBag size={20} className="text-blue-500" strokeWidth={2} />
          </div>
          <p className="text-3xl font-bold tabular text-ink dark:text-white">{cartCount}</p>
          <p className="mt-1 text-sm text-ink-muted">Items in cart</p>
          <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber transition-all group-hover:gap-2">
            View cart <ArrowRight size={12} />
          </p>
        </Link>

        {/* Wishlist */}
        <div className="rounded-xl border border-border bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-dark-border dark:bg-dark-surface">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
            <Heart size={20} className="text-red-500" strokeWidth={2} />
          </div>
          <p className="text-3xl font-bold tabular text-ink dark:text-white">{wishlistCount}</p>
          <p className="mt-1 text-sm text-ink-muted">Wishlisted items</p>
          <a
            href="/wishlist"
            className="mt-4 inline-block text-sm font-medium text-amber-600 hover:underline"
          >
            View wishlist →
          </a>
        </div>

        {/* Admin — only if admin role */}
        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="group col-span-full rounded-xl border border-amber/40 bg-amber-dim p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-amber/10 sm:col-span-1"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber text-white">
              <LayoutDashboard size={20} strokeWidth={2} />
            </div>
            <p className="font-serif text-xl dark:text-white">Admin Dashboard</p>
            <p className="mt-1 text-sm text-amber/70">Stats · Products · Live Orders</p>
            <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber transition-all group-hover:gap-2">
              Open dashboard <ArrowRight size={12} />
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}

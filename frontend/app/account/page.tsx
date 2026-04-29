"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, ShoppingBag, Heart, LayoutDashboard, LogOut,
  ArrowRight, Package, Settings, MapPin, CreditCard,
  ChevronRight, Star, Bell, Shield
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore, type CartState } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/stores/toastStore";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarGradient(name?: string | null) {
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-pink-500 to-rose-600",
  ];
  if (!name) return gradients[0];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export default function AccountPage() {
  const user        = useAuthStore((s) => s.user);
  const setAuth     = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout      = useAuthStore((s) => s.logout);
  const cartCount   = useCartStore((s: CartState) => s.totalItems());
  const cartTotal   = useCartStore((s: CartState) => s.totalPrice());
  const wishlistCount = useWishlistStore((s) => s.count());
  const router      = useRouter();

  const [fetchedUser, setFetchedUser] = useState(user);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (user) { setFetchedUser(user); return; }
    if (!accessToken) return;
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return;
        const data = await res.json() as { success: boolean; data?: { id: string; name: string; email: string; role: "customer" | "admin"; createdAt: string } };
        if (data.success && data.data) {
          setAuth(data.data, accessToken);
          setFetchedUser(data.data);
        }
      } catch { /* silently skip */ }
    };
    void fetchMe();
  }, [user, accessToken, setAuth]);

  const displayUser = fetchedUser ?? user;
  const gradient = getAvatarGradient(displayUser?.name);
  const initials = getInitials(displayUser?.name);
  const memberSince = displayUser && "createdAt" in displayUser
    ? new Date((displayUser as { createdAt: string }).createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    logout();
    toast.success("Signed out", "See you next time!");
    router.push("/auth/login");
  };

  const quickLinks = [
    { href: "/cart",     icon: ShoppingBag, label: "My Cart",     value: cartCount,     sub: cartCount > 0 ? `$${cartTotal.toFixed(2)} total` : "Empty", color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-500/10",   border: "group-hover:border-blue-200" },
    { href: "/wishlist", icon: Heart,       label: "Wishlist",    value: wishlistCount, sub: wishlistCount === 1 ? "1 item saved" : `${wishlistCount} items saved`, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10", border: "group-hover:border-rose-200" },
  ];

  const menuItems = [
    { icon: Package,    label: "My Orders",         sub: "Track & manage orders",     href: "/account/orders" },
    { icon: MapPin,     label: "Addresses",          sub: "Shipping & billing info",   href: "/account/addresses" },
    { icon: CreditCard, label: "Payment Methods",    sub: "Cards & payment options",   href: "/account/payments" },
    { icon: Bell,       label: "Notifications",      sub: "Email & push preferences",  href: "/account/notifications" },
    { icon: Shield,     label: "Security",           sub: "Password & 2FA",           href: "/account/security" },
    { icon: Settings,   label: "Account Settings",   sub: "Personal info & privacy",   href: "/account/settings" },
  ];

  return (
    <>
      <ConfirmDialog
        open={showLogoutDialog}
        title="Sign out of MERNShop?"
        description="You'll need to sign in again to access your cart, orders, and account settings."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        variant="warning"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <div className="mx-auto max-w-4xl pb-20">

        {/* ── Hero banner ──────────────────────────────────────────────────── */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10">
          {/* Background pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          {/* Glow blobs */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            {/* Avatar */}
            <div className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg text-2xl font-bold text-white ring-4 ring-white/10`}>
              {initials}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {displayUser?.name ?? "Guest"}
                </h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  displayUser?.role === "admin"
                    ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30"
                    : "bg-white/10 text-white/70 ring-1 ring-white/15"
                }`}>
                  {displayUser?.role === "admin" ? "⚡ Admin" : "Customer"}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/60">{displayUser?.email}</p>
              {memberSince && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
                  <Star size={10} fill="currentColor" /> Member since {memberSince}
                </p>
              )}
            </div>

            {/* Sign out button */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/30"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        {/* ── Quick stats ───────────────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {quickLinks.map(({ href, icon: Icon, label, value, sub, color, bg, border }) => (
            <Link
              key={href}
              href={href}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${border} dark:border-dark-border dark:bg-dark-surface`}
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={20} className={color} strokeWidth={2} />
              </div>
              <p className="text-3xl font-bold tabular-nums text-ink dark:text-white">{value}</p>
              <p className="mt-0.5 text-sm font-medium text-ink-soft dark:text-white/70">{label}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{sub}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-all group-hover:opacity-100">
                View <ArrowRight size={11} />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Admin shortcut ────────────────────────────────────────────────── */}
        {displayUser?.role === "admin" && (
          <Link
            href="/admin"
            className="group mb-6 flex items-center justify-between rounded-2xl border border-amber/30 bg-gradient-to-r from-amber-50 to-orange-50 p-5 transition-all hover:shadow-md dark:border-amber/20 dark:from-amber/10 dark:to-orange-500/5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber text-white shadow-sm">
                <LayoutDashboard size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-ink dark:text-white">Admin Dashboard</p>
                <p className="text-sm text-ink-muted">Stats · Products · Live Orders</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-amber transition-transform group-hover:translate-x-1" />
          </Link>
        )}

        {/* ── Menu items ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface">
          {menuItems.map(({ icon: Icon, label, sub, href }, i) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-surface-raised dark:hover:bg-dark-surface-2 ${
                i !== menuItems.length - 1 ? "border-b border-border dark:border-dark-border" : ""
              }`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface-raised dark:bg-dark-surface-2">
                <Icon size={16} className="text-ink-muted dark:text-white/50" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink dark:text-white">{label}</p>
                <p className="text-xs text-ink-muted">{sub}</p>
              </div>
              <ChevronRight size={15} className="text-ink-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-white/30" />
            </Link>
          ))}
        </div>

      </div>
    </>
  );
}

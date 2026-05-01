"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export function HeroCTA() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isAuth  = useAuthStore((s) => s.isAuthenticated);
  const role    = useAuthStore((s) => s.user?.role);
  const isAdmin = mounted && isAuth && role === "admin";
  const isUser  = mounted && isAuth && role !== "admin";

  // Guest — show Shop Now + Create Account
  if (!mounted || (!isAuth)) {
    return (
      <div className="animate-hero-3 flex flex-wrap gap-3">
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[13px] font-semibold tracking-wide text-white shadow-md shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/35 active:scale-[0.97]"
        >
          Shop Now
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-7 py-3.5 text-[13px] font-semibold tracking-wide text-ink-soft shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-light hover:text-primary hover:shadow-sm active:scale-[0.97] dark:border-dark-border dark:bg-dark-surface dark:text-white dark:hover:border-primary/50 dark:hover:bg-primary/10 dark:hover:text-primary"
        >
          Create Account
        </Link>
      </div>
    );
  }

  // Admin — go to dashboard only
  if (isAdmin) {
    return (
      <div className="animate-hero-3 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="group inline-flex items-center gap-2 rounded-xl bg-amber px-7 py-3.5 text-[13px] font-semibold tracking-wide text-white shadow-md shadow-amber/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lg active:scale-[0.97]"
        >
          <LayoutDashboard size={15} />
          Go to Dashboard
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  // Logged-in customer — Shop Now only, no Create Account
  if (isUser) {
    return (
      <div className="animate-hero-3 flex flex-wrap gap-3">
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[13px] font-semibold tracking-wide text-white shadow-md shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/35 active:scale-[0.97]"
        >
          Shop Now
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
        <Link
          href="/account"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-7 py-3.5 text-[13px] font-semibold tracking-wide text-ink-soft shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-light hover:text-primary hover:shadow-sm active:scale-[0.97] dark:border-dark-border dark:bg-dark-surface dark:text-white"
        >
          My Account
        </Link>
      </div>
    );
  }

  return null;
}

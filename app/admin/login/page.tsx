"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ShoppingBag, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { adminLoginAction } from "@/app/actions/cart";

const Schema = z.object({
  email:    z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof Schema>;

const ADMIN_EMAIL = "admin@mernshop.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: "onTouched",
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);

    // Server action sets the HttpOnly cookie middleware can read
    const result = await adminLoginAction(data.email, data.password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    // Populate Zustand so navbar shows Admin Dashboard immediately
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: "admin-1",
        name: "Admin",
        email: ADMIN_EMAIL,
        role: "admin",
        createdAt: new Date().toISOString(),
      },
    });
    window.dispatchEvent(new Event("storage"));

    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment px-4 dark:bg-dark-bg">
      <div className="w-full max-w-sm">

        <Link href="/" className="mb-8 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-white/50 dark:hover:text-white">
          <ArrowLeft size={14} strokeWidth={2} />
          Back to store
        </Link>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:border-dark-border dark:bg-dark-surface">

          <div className="mb-7 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber">
              <ShoppingBag size={22} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">
                Admin Portal
              </h1>
              <p className="mt-1 text-sm text-ink-muted">Restricted access — authorized personnel only.</p>
            </div>
          </div>

          <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@mernshop.com"
                autoComplete="email"
                {...register("email")}
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-[14px] text-ink outline-none transition-all placeholder:text-ink-muted/50 focus:border-amber focus:ring-1 focus:ring-amber/30 dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password")}
                className="h-11 w-full rounded-lg border border-border bg-white px-3 text-[14px] text-ink outline-none transition-all placeholder:text-ink-muted/50 focus:border-amber focus:ring-1 focus:ring-amber/30 dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400" role="alert">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2.5 dark:border-dark-border dark:bg-dark-surface-2">
              <ShieldCheck size={14} className="flex-shrink-0 text-amber" strokeWidth={2} />
              <p className="text-xs text-ink-muted">
                Admin access is restricted. Contact your system administrator.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink text-[13px] font-semibold tracking-wide text-white transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-60 dark:bg-amber dark:hover:bg-amber-600"
            >
              {isSubmitting ? (
                <><Loader2 size={15} className="animate-spin" /> Signing in…</>
              ) : "Sign In to Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

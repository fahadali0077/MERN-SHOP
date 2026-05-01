"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ShoppingBag, Loader2, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { adminLoginAction } from "@/app/actions/auth";
import type { User } from "@/types";

const Schema = z.object({
  email:    z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof Schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [error, setError]           = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated as admin, skip straight to dashboard
  useEffect(() => {
    if (useAuthStore.getState().user?.role === "admin") {
      router.replace("/admin");
    }
  }, [router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: "onTouched",
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      const result = await adminLoginAction(data.email, data.password);

      if (!result.success || !result.data) {
        setError(result.message ?? "Login failed");
        return;
      }

      // Store the REAL user returned by the API — not a hardcoded stub
      setAuth(result.data.user as User, result.data.accessToken);

      // Hard redirect so the mernshop_admin cookie is sent with the next request
      window.location.href = "/admin";
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">

      {/* Back link */}
      <Link
        href="/"
        className="absolute left-6 top-6 flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
      >
        <ArrowLeft size={14} strokeWidth={2} />
        Back to store
      </Link>

      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900 shadow-2xl">

          {/* Amber top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />

          <div className="p-8">
            {/* Logo + title */}
            <div className="mb-8 flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                <ShoppingBag size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-normal text-white">Admin Portal</h1>
                <p className="mt-1 text-sm text-white/50">MERNShop — restricted access</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="flex flex-col gap-5" noValidate>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="admin-email" className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@example.com"
                  {...register("email")}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-amber-400/60 focus:bg-white/8 focus:ring-1 focus:ring-amber-400/20"
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="admin-password" className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    {...register("password")}
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-amber-400/60 focus:bg-white/8 focus:ring-1 focus:ring-amber-400/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-white/30 hover:text-white/70"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-[13px] font-bold tracking-wide text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-orange-400 hover:shadow-amber-400/30 active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><Loader2 size={15} className="animate-spin" /> Signing in…</>
                ) : (
                  <><Lock size={14} /> Sign In to Admin</>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] px-8 py-4 text-center">
            <p className="text-[11px] text-white/25">
              Unauthorized access is prohibited and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

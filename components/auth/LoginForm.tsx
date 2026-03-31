"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [errors,      setErrors]      = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  const router = useRouter();
  const login  = useAuthStore((s) => s.login);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validateEmail    = (v: string) => emailRegex.test(v) ? undefined : "Please enter a valid email address";
  const validatePassword = (v: string) => v.length >= 6     ? undefined : "Password must be at least 6 characters";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const emailErr = validateEmail(email);
    const passErr  = validatePassword(password);
    if (emailErr || passErr) { setErrors({ email: emailErr, password: passErr }); return; }

    setLoading(true);
    await login(email, password);
    window.dispatchEvent(new Event("storage"));
    setLoading(false);
    setSuccess(true);

    setTimeout(() => router.push("/account"), 1400);
  };

  return (
    <>
      {/* Success toast */}
      {success && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 animate-slide-up">
          <div className="flex items-center gap-2.5 rounded-full bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-xl shadow-green-600/25">
            <CheckCircle2 size={16} strokeWidth={2.5} />
            Welcome back! Redirecting…
          </div>
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5" noValidate>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-ink dark:text-white">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            onBlur={() => setErrors((p) => ({ ...p, email: validateEmail(email) }))}
            className={[
              "search-enhanced h-11 w-full rounded-xl border px-4 py-2.5 text-[14px] text-ink outline-none",
              "dark:bg-dark-surface dark:text-white",
              "placeholder:text-ink-muted",
              errors.email
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                : "border-border dark:border-dark-border",
            ].join(" ")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 animate-slide-up">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-ink dark:text-white">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              onBlur={() => setErrors((p) => ({ ...p, password: validatePassword(password) }))}
              className={[
                "search-enhanced h-11 w-full rounded-xl border px-4 py-2.5 pr-11 text-[14px] text-ink outline-none",
                "dark:bg-dark-surface dark:text-white placeholder:text-ink-muted",
                errors.password
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                  : "border-border dark:border-dark-border",
              ].join(" ")}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink dark:hover:text-white"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 animate-slide-up">{errors.password}</p>
          )}
        </div>

        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 animate-slide-up" role="alert">
            {submitError}
          </div>
        )}

        <p className="text-center text-xs text-ink-muted">
          Use any valid email and a password of 6+ characters.
        </p>

        <button
          type="submit"
          disabled={loading || success}
          className={[
            "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold tracking-wide text-white",
            "transition-all duration-200 active:scale-[0.97] disabled:opacity-60",
            success
              ? "bg-green-600 shadow-md shadow-green-600/25"
              : "bg-primary shadow-md shadow-primary/25 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30",
          ].join(" ")}
        >
          {loading  ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> :
           success  ? <><CheckCircle2 size={16} /> Signed in!</> :
           "Sign In"}
        </button>

      </form>
    </>
  );
}

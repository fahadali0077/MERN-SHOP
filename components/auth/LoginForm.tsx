"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  // ----- validation helpers -----
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (val: string) => {
    if (!emailRegex.test(val)) return "Please enter a valid email address";
    return undefined;
  };
  const validatePassword = (val: string) => {
    if (val.length < 6) return "Password must be at least 6 characters";
    return undefined;
  };

  const handleEmailBlur = () => {
    const err = validateEmail(email);
    setErrors((p) => ({ ...p, email: err }));
  };
  const handlePasswordBlur = () => {
    const err = validatePassword(password);
    setErrors((p) => ({ ...p, password: err }));
  };

  // ----- submit -----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setLoading(true);

    await login(email, password);

    window.dispatchEvent(new Event("storage"));

    setLoading(false);
    setShowToast(true);

    setTimeout(() => {
      router.push("/account");
    }, 1500);
  };

  return (
    <>
      {/* Toast */}
      {showToast && (
        <div className="animate-fade-up-1 fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow-lg">
          Welcome back! Redirecting…
        </div>
      )}

      <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-5" noValidate>
        {/* Email */}
        <div className="flex flex-col gap-1">
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
            onBlur={handleEmailBlur}
            className={`h-11 w-full rounded-lg border px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-amber focus:ring-1 focus:ring-amber/30 dark:bg-dark-surface dark:text-white ${errors.email
              ? "border-red-500 focus:ring-red-300"
              : "border-border dark:border-dark-border"
              }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
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
              onBlur={handlePasswordBlur}
              className={`h-11 w-full rounded-lg border px-3.5 py-2.5 pr-10 text-[14px] text-ink outline-none transition-colors focus:border-amber focus:ring-1 focus:ring-amber/30 dark:bg-dark-surface dark:text-white ${errors.password
                ? "border-red-500 focus:ring-red-300"
                : "border-border dark:border-dark-border"
                }`}
            />
            <button
              type="button"
              onClick={() => { setShowPass((v) => !v); }}
              aria-label={showPass ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink dark:hover:text-white"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400" role="alert">
            {submitError}
          </div>
        )}

        <p className="text-center text-xs text-ink-muted">
          Use any valid email and a password of 6+ characters.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-[13px] font-semibold tracking-wide text-white transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-60 dark:bg-amber dark:hover:bg-amber-600"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Signing in…</>
          ) : "Sign In"}
        </button>
        <p className="mt-5 text-center text-sm text-ink-muted">
          Don't have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-amber hover:underline">
            Create one →
          </Link>
        </p>

      </form>
    </>
  );
}


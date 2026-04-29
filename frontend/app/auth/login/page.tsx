"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { toast } from "@/stores/toastStore";

function LoginPageInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("Account created!", "You can now sign in with your new account.");
    }
    if (searchParams.get("session") === "expired") {
      toast.warning("Session expired", "Please sign in again to continue.");
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-8">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-white/50 dark:hover:text-white">
          <ArrowLeft size={14} strokeWidth={2} />
          Back to store
        </Link>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <div className="mb-7 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink dark:bg-amber">
              <ShoppingBag size={22} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-ink-muted">Sign in to your account</p>
            </div>
          </div>

          <LoginForm />
        </div>

        <p className="mt-5 text-center text-sm text-ink-muted">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-amber hover:underline">
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

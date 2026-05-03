"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { resendVerificationAction } from "@/app/actions/auth";

function VerifyEmailSentInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email || resending || resent) return;
    setResending(true);
    await resendVerificationAction(email);
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 8000);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-8">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-white/50 dark:hover:text-white">
          <ArrowLeft size={14} strokeWidth={2} />
          Back to store
        </Link>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <div className="mb-6 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber/10">
              <Mail size={30} className="text-amber-500" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">Check your inbox</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                We sent a verification link to{" "}
                {email && <strong className="text-ink dark:text-white">{email}</strong>}.
                {!email && "your email address."}
              </p>
              <p className="mt-1 text-sm text-ink-muted">Click the link to activate your account.</p>
            </div>
          </div>

          <div className="space-y-3">
            {resent ? (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 size={16} />
                Resent! Check your inbox again.
              </div>
            ) : (
              <button
                onClick={() => void handleResend()}
                disabled={resending || !email}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-raised disabled:opacity-50 dark:border-dark-border dark:text-white dark:hover:bg-dark-surface-2"
              >
                {resending ? <><Loader2 size={15} className="animate-spin" /> Resending…</> : "Resend verification email"}
              </button>
            )}

            <Link
              href="/auth/login"
              className="block text-center text-sm text-ink-muted hover:text-ink dark:hover:text-white"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>

        <p className="mt-4 text-xs text-ink-muted">
          The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense>
      <VerifyEmailSentInner />
    </Suspense>
  );
}

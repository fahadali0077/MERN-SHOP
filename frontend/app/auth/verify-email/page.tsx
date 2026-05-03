"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyEmailAction } from "@/app/actions/auth";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token found in URL.");
      return;
    }

    verifyEmailAction(token).then((result) => {
      if (result.success && result.data) {
        setAuth(result.data.user as unknown as User, result.data.accessToken);
        // Store welcome name for the banner
        if (typeof window !== "undefined") {
          sessionStorage.setItem("mernshop_welcome", result.data.user.name);
        }
        setStatus("success");
        setTimeout(() => router.push("/"), 2000);
      } else {
        setStatus("error");
        setErrorMsg(result.message ?? "Verification failed.");
      }
    }).catch(() => {
      setStatus("error");
      setErrorMsg("An unexpected error occurred.");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 text-center shadow-sm dark:border-dark-border dark:bg-dark-surface">
        {status === "loading" && (
          <>
            <Loader2 size={40} className="mx-auto mb-4 animate-spin text-amber-500" strokeWidth={1.5} />
            <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">Verifying your email…</h1>
            <p className="mt-2 text-sm text-ink-muted">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 size={40} className="mx-auto mb-4 text-green-500" strokeWidth={1.5} />
            <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">Email verified!</h1>
            <p className="mt-2 text-sm text-ink-muted">Redirecting you to the store…</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={40} className="mx-auto mb-4 text-red-500" strokeWidth={1.5} />
            <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">Verification failed</h1>
            <p className="mt-2 text-sm text-ink-muted">{errorMsg}</p>
            <a
              href="/auth/verify-email-sent"
              className="mt-5 inline-block rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Request a new link
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}

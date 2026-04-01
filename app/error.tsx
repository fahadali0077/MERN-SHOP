"use client";

import { ArrowLeft, AlertTriangle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
        <AlertTriangle size={28} className="text-red-500" strokeWidth={1.5} />
      </div>
      <div>
        <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-muted">{error.message || "An unexpected error occurred."}</p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-border">Ref: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft dark:bg-amber dark:hover:bg-amber-600"
      >
        Try again
      </button>
    </div>
  );
}

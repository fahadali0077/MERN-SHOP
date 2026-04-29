"use client";

import { useEffect, useRef } from "react";
import { useToastStore, type Toast } from "@/stores/toastStore";
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const STYLES = {
  success: {
    bar:  "bg-green-500",
    icon: "text-green-500",
    bg:   "bg-white dark:bg-dark-surface",
  },
  error: {
    bar:  "bg-red-500",
    icon: "text-red-500",
    bg:   "bg-white dark:bg-dark-surface",
  },
  warning: {
    bar:  "bg-amber-400",
    icon: "text-amber-500",
    bg:   "bg-white dark:bg-dark-surface",
  },
  info: {
    bar:  "bg-blue-500",
    icon: "text-blue-500",
    bg:   "bg-white dark:bg-dark-surface",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const Icon = ICONS[toast.variant];
  const styles = STYLES[toast.variant];
  const duration = toast.duration ?? 4000;
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    // Animate the progress bar from 100% → 0%
    el.style.transition = "none";
    el.style.width = "100%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `width ${duration}ms linear`;
        el.style.width = "0%";
      });
    });
  }, [duration]);

  return (
    <div
      className={cn(
        "relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-border shadow-lg",
        "animate-in slide-in-from-right-4 fade-in duration-300",
        styles.bg,
        "dark:border-dark-border",
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Left accent bar */}
      <div className={cn("absolute left-0 top-0 h-full w-1 rounded-l-xl", styles.bar)} />

      <div className="flex flex-1 items-start gap-3 pl-4 pr-2 py-4">
        <Icon size={18} className={cn("mt-0.5 flex-shrink-0", styles.icon)} strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink dark:text-white">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs leading-relaxed text-ink-muted dark:text-white/60">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={() => remove(toast.id)}
          className="flex-shrink-0 rounded-md p-1 text-ink-muted transition-colors hover:bg-border/60 hover:text-ink dark:hover:bg-dark-border dark:hover:text-white"
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/40 dark:bg-dark-border">
        <div ref={progressRef} className={cn("h-full rounded-full", styles.bar, "opacity-60")} />
      </div>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[200] flex flex-col-reverse gap-2 sm:bottom-6 sm:right-6"
      style={{ maxWidth: "min(calc(100vw - 2rem), 384px)" }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

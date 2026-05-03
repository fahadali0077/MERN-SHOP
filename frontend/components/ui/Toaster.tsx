"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  success: { bar: "bg-green-500", icon: "text-green-500" },
  error:   { bar: "bg-red-500",   icon: "text-red-500"   },
  warning: { bar: "bg-amber-400", icon: "text-amber-500" },
  info:    { bar: "bg-blue-500",  icon: "text-blue-500"  },
};

const MAX_TOASTS = 3;

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const Icon = ICONS[toast.variant];
  const styles = STYLES[toast.variant];
  const duration = toast.duration ?? 4000;
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
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
    <motion.div
      layout
      initial={{ y: -20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-border shadow-lg",
        "bg-white dark:border-dark-border dark:bg-dark-surface",
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Left accent bar */}
      <div className={cn("absolute left-0 top-0 h-full w-1 rounded-l-xl", styles.bar)} />

      <div className="flex flex-1 items-start gap-3 pl-4 pr-2 py-4">
        <Icon size={18} className={cn("mt-0.5 flex-shrink-0", styles.icon)} strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium leading-snug text-ink dark:text-white">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted dark:text-white/60">
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
        <div ref={progressRef} className={cn("h-full rounded-full opacity-60", styles.bar)} />
      </div>
    </motion.div>
  );
}

// ── Welcome Banner ────────────────────────────────────────────────────────────
export function WelcomeBanner() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("mernshop_welcome");
    if (stored) {
      setName(stored);
      sessionStorage.removeItem("mernshop_welcome");
      setTimeout(() => setName(null), 5000);
    }
  }, []);

  return (
    <AnimatePresence>
      {name && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-amber-50 border-b border-amber/30 dark:bg-amber/10 dark:border-amber/20"
        >
          <p className="mx-auto max-w-screen-xl px-5 py-2.5 text-center text-sm font-medium text-amber-800 dark:text-amber-300 sm:px-8 md:px-10">
            Welcome, {name}! 👋 Glad you&apos;re here.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Toaster ───────────────────────────────────────────────────────────────────
export function Toaster() {
  const allToasts = useToastStore((s) => s.toasts);
  // Show max 3, newest at top
  const toasts = allToasts.slice(-MAX_TOASTS);

  return (
    <div
      aria-label="Notifications"
      className="fixed top-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col gap-2"
      style={{ width: "min(calc(100vw - 2rem), 384px)" }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button when opened (safer default)
  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmStyles = {
    danger:  "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200 dark:shadow-red-900/30",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200 dark:shadow-amber-900/30",
    default: "bg-ink hover:bg-ink-soft text-white dark:bg-amber dark:hover:bg-amber-600",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-desc"
        className={cn(
          "fixed left-1/2 top-1/2 z-[301] w-full max-w-md -translate-x-1/2 -translate-y-1/2",
          "rounded-2xl border border-border bg-white p-6 shadow-2xl",
          "dark:border-dark-border dark:bg-dark-surface",
          "animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-border/60 hover:text-ink dark:hover:bg-dark-border dark:hover:text-white"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {/* Icon + Title */}
        <div className="mb-4 flex items-start gap-4">
          <div className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
            variant === "danger"  ? "bg-red-50 dark:bg-red-900/20" :
            variant === "warning" ? "bg-amber-50 dark:bg-amber/10" :
            "bg-surface-raised dark:bg-dark-surface-2"
          )}>
            <AlertTriangle
              size={20}
              strokeWidth={2}
              className={cn(
                variant === "danger"  ? "text-red-500" :
                variant === "warning" ? "text-amber-500" :
                "text-ink-muted"
              )}
            />
          </div>
          <div>
            <h2 id="dialog-title" className="font-semibold text-ink dark:text-white">
              {title}
            </h2>
            <p id="dialog-desc" className="mt-1 text-sm leading-relaxed text-ink-muted dark:text-white/60">
              {description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-ink-muted transition-all hover:border-ink/30 hover:text-ink dark:border-dark-border dark:text-white"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97]",
              confirmStyles[variant]
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

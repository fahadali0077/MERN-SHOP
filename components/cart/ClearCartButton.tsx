"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { clearCart } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";

export function ClearCartButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      className="mt-3 w-full text-xs text-ink-muted hover:border-red-300 hover:text-red-600 disabled:opacity-50 dark:border-dark-border dark:text-white"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await clearCart();
        });
      }}
    >
      {isPending ? <><Loader2 size={12} className="animate-spin" /> Clearing…</> : "Clear cart"}
    </Button>
  );
}

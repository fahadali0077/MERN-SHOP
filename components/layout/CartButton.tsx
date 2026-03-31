"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore, type CartState } from "@/stores/cartStore";

export function CartButton() {
  const count      = useCartStore((s: CartState) => s.totalItems());
  const openDrawer = useCartStore((s: CartState) => s.openDrawer);

  return (
    <button
      onClick={openDrawer}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-ink-soft shadow-xs transition-all hover:border-amber hover:text-amber dark:border-dark-border dark:bg-dark-surface dark:text-white/70"
      aria-label={`Open cart — ${count} item${count !== 1 ? "s" : ""}`}
    >
      <ShoppingCart size={16} strokeWidth={2} />
      {count > 0 && (
        <span
          className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber px-1 text-[10px] font-bold text-white ring-2 ring-parchment dark:ring-dark-bg"
          aria-live="polite"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

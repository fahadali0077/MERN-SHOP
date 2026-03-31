"use client";

import { useState, useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore, type CartState } from "@/stores/cartStore";

export function CartButton() {
  const count      = useCartStore((s: CartState) => s.totalItems());
  const openDrawer = useCartStore((s: CartState) => s.openDrawer);
  const prevCount  = useRef(count);
  const [wiggling, setWiggling] = useState(false);

  // Wiggle cart icon when item is added
  useEffect(() => {
    if (count > prevCount.current) {
      setWiggling(true);
      setTimeout(() => setWiggling(false), 550);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <button
      onClick={openDrawer}
      className={[
        "relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200",
        "border-border bg-white text-ink-soft shadow-xs",
        "hover:border-primary hover:bg-primary-light hover:text-primary hover:shadow-sm",
        "active:scale-95",
        "dark:border-dark-border dark:bg-dark-surface dark:text-white/70",
        "dark:hover:border-primary dark:hover:bg-primary/10 dark:hover:text-primary",
      ].join(" ")}
      aria-label={`Open cart — ${count} item${count !== 1 ? "s" : ""}`}
    >
      <ShoppingCart
        size={16}
        strokeWidth={2}
        className={wiggling ? "cart-wiggle" : ""}
      />
      {count > 0 && (
        <span
          className={[
            "absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center",
            "rounded-full bg-primary px-1 text-[10px] font-bold text-white",
            "ring-2 ring-white dark:ring-dark-bg",
            wiggling ? "badge-entrance" : "",
          ].join(" ")}
          aria-live="polite"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

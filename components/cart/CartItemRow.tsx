"use client";

/**
 * CartItemRow — Client Component.
 *
 * COMPOSITION PATTERN in the cart page:
 *   CartPage (Server Component)
 *     └── renders item data from cookie (server)
 *     └── CartItemRow (Client Component) ← interactive: qty stepper + remove
 *
 * The Server Component owns the data (reads cookie, computes totals).
 * CartItemRow owns the interactivity (calls Server Actions on button clicks).
 *
 * useTransition:
 *   Server Actions are async. useTransition gives us isPending so we can
 *   show a loading state while the action runs. Without it, the button
 *   has no visual feedback during the ~100ms cookie write + revalidation.
 *
 * Optimistic UI:
 *   For the qty stepper we show the new qty immediately (via local state),
 *   then let the Server Action + revalidatePath sync the server. This makes
 *   the stepper feel instant even over slow connections.
 */

import { useTransition, useState } from "react";
import Link from "next/link";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { removeFromCart, updateCartQty } from "@/app/actions/cart";
import type { CartItem } from "@/types";
import { cn } from "@/lib/utils";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { product, qty } = item;
  const [isPending, startTransition] = useTransition();
  // Optimistic local qty — shows new value before server confirms
  const [optimisticQty, setOptimisticQty] = useState(qty);

  const handleUpdateQty = (newQty: number) => {
    if (newQty < 0) return;
    setOptimisticQty(newQty); // instant UI update
    startTransition(async () => {
      await updateCartQty(product.id, newQty);
      // revalidatePath in the action will sync server state
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromCart(product.id);
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 transition-opacity md:gap-5 md:p-5",
        isPending && "opacity-50",
      )}
    >
      {/* Product image */}
      <img
        src={product.image}
        alt={product.name}
        className="h-16 w-16 flex-shrink-0 rounded-lg object-cover bg-cream md:h-20 md:w-20"
      />

      {/* Product info */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${product.id}`}
          className="block truncate font-medium text-ink transition-colors hover:text-amber dark:text-white"
        >
          {product.name}
        </Link>
        <p className="mt-0.5 text-xs uppercase tracking-wider text-ink-muted">
          {product.category}
        </p>
        <p className="mt-1 text-sm font-semibold text-ink-muted">
          ${product.price.toFixed(2)} each
        </p>
      </div>

      {/* Qty stepper */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <button
          className="flex h-7 w-7 items-center justify-center rounded border border-border bg-cream text-ink hover:bg-border disabled:opacity-40 dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
          onClick={() => { handleUpdateQty(optimisticQty - 1); }}
          disabled={isPending}
          aria-label="Decrease quantity"
        >
          <Minus size={11} />
        </button>
        <span className="w-7 text-center text-sm font-semibold tabular-nums dark:text-white">
          {isPending ? <Loader2 size={12} className="mx-auto animate-spin" /> : optimisticQty}
        </span>
        <button
          className="flex h-7 w-7 items-center justify-center rounded border border-border bg-cream text-ink hover:bg-border disabled:opacity-40 dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
          onClick={() => { handleUpdateQty(optimisticQty + 1); }}
          disabled={isPending}
          aria-label="Increase quantity"
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Line total */}
      <span className="hidden w-20 text-right text-sm font-bold tabular-nums text-ink dark:text-white sm:block">
        ${(product.price * optimisticQty).toFixed(2)}
      </span>

      {/* Remove */}
      <button
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20"
        onClick={handleRemove}
        disabled={isPending}
        aria-label={`Remove ${product.name}`}
      >
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
      </button>
    </div>
  );
}

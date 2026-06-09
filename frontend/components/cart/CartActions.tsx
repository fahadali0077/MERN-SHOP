"use client";

import { useTransition } from "react";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { removeFromCart, updateCartQty, clearCart } from "@/app/actions/cart";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "@/stores/toastStore";

// FIX #1: every action result re-seeds the mirror so the navbar badge/drawer
// stay consistent with the cookie cart that the /cart page renders from.

export function RemoveButton({ productId, productName }: { productId: string; productName: string }) {
  const [isPending, startTransition] = useTransition();
  const setItems = useCartStore((s) => s.setItems);

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await removeFromCart(productId);
          if (result.success && result.data) {
            setItems(result.data.items);
            toast.info("Item removed", `${productName} removed from your cart.`);
          } else {
            toast.error("Could not remove item", result.message);
          }
        })
      }
      disabled={isPending}
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20"
      aria-label={`Remove ${productName} from cart`}
    >
      {isPending ? <Loader2 size={13} className="animate-spin" /> : <X size={14} />}
    </button>
  );
}

export function QtyStepper({ productId, currentQty }: { productId: string; currentQty: number }) {
  const [isPending, startTransition] = useTransition();
  const setItems = useCartStore((s) => s.setItems);

  const update = (newQty: number) => {
    startTransition(async () => {
      const result = await updateCartQty(productId, newQty);
      if (result.success && result.data) setItems(result.data.items);
      else toast.error("Could not update quantity", result.message);
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => update(currentQty - 1)} disabled={isPending}
        className="flex h-7 w-7 items-center justify-center rounded border border-border bg-cream text-ink hover:bg-border disabled:opacity-40 dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
        aria-label="Decrease quantity">
        {isPending ? <Loader2 size={10} className="animate-spin" /> : <Minus size={11} />}
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums dark:text-white">{currentQty}</span>
      <button onClick={() => update(currentQty + 1)} disabled={isPending}
        className="flex h-7 w-7 items-center justify-center rounded border border-border bg-cream text-ink hover:bg-border disabled:opacity-40 dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
        aria-label="Increase quantity">
        {isPending ? <Loader2 size={10} className="animate-spin" /> : <Plus size={11} />}
      </button>
    </div>
  );
}

export function ClearCartButton() {
  const [isPending, startTransition] = useTransition();
  const setItems = useCartStore((s) => s.setItems);

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await clearCart();
          if (result.success && result.data) {
            setItems(result.data.items);
            toast.info("Cart cleared", "All items have been removed.");
          } else {
            toast.error("Could not clear cart", result.message);
          }
        })
      }
      disabled={isPending}
      className="mt-3 w-full rounded-lg border border-border px-5 py-2.5 text-xs font-medium text-ink-muted transition-all hover:border-red-300 hover:text-red-600 disabled:opacity-40 dark:border-dark-border dark:text-white"
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" /> Clearing…</span>
      ) : (
        "Clear cart"
      )}
    </button>
  );
}

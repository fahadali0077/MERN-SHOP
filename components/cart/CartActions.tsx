"use client";



import { useTransition } from "react";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { removeFromCart, updateCartQty, clearCart } from "@/app/actions/cart";
import type { ActionResult } from "@/types";

// ── Remove button ─────────────────────────────────────────────────────────────
interface RemoveButtonProps { productId: string; productName: string; }

export function RemoveButton({ productId, productName }: RemoveButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await removeFromCart(productId);
        });
      }}
      disabled={isPending}
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20"
      aria-label={`Remove ${productName} from cart`}
    >
      {isPending ? <Loader2 size={13} className="animate-spin" /> : <X size={14} />}
    </button>
  );
}

// ── Qty stepper ───────────────────────────────────────────────────────────────
interface QtyStepperProps {
  productId: string;
  currentQty: number;
}

export function QtyStepper({ productId, currentQty }: QtyStepperProps) {
  const [isPending, startTransition] = useTransition();

  const update = (newQty: number) => {
    startTransition(async () => {
      await updateCartQty(productId, newQty);
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => { update(currentQty - 1); }}
        disabled={isPending}
        className="flex h-7 w-7 items-center justify-center rounded border border-border bg-cream text-ink hover:bg-border disabled:opacity-40 dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
        aria-label="Decrease quantity"
      >
        {isPending ? <Loader2 size={10} className="animate-spin" /> : <Minus size={11} />}
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums dark:text-white">
        {currentQty}
      </span>
      <button
        onClick={() => { update(currentQty + 1); }}
        disabled={isPending}
        className="flex h-7 w-7 items-center justify-center rounded border border-border bg-cream text-ink hover:bg-border disabled:opacity-40 dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
        aria-label="Increase quantity"
      >
        {isPending ? <Loader2 size={10} className="animate-spin" /> : <Plus size={11} />}
      </button>
    </div>
  );
}

// ── Clear cart button ─────────────────────────────────────────────────────────
export function ClearCartButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await clearCart();
        });
      }}
      disabled={isPending}
      className="mt-3 w-full rounded-lg border border-border px-5 py-2.5 text-xs font-medium text-ink-muted transition-all hover:border-red-300 hover:text-red-600 disabled:opacity-40 dark:border-dark-border dark:text-white"
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 size={13} className="animate-spin" /> Clearing…
        </span>
      ) : (
        "Clear cart"
      )}
    </button>
  );
}

// ── Add to cart button (used from product pages) ──────────────────────────────
interface AddToCartActionButtonProps {
  productId: string;
  productName: string;
  isInCart: boolean;
}

export function AddToCartActionButton({
  productId,
  productName,
  isInCart,
}: AddToCartActionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      let result: ActionResult; | void>;
      if (isInCart) {
        result = await removeFromCart(productId);
      } else {
        const { addToCart } = await import("@/types");
        result = await addToCart(productId, 1);
      }
      if (!result.success) {
        console.error(result.message);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isInCart}
      aria-label={isInCart ? `Remove ${productName} from cart` : `Add ${productName} to cart`}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all disabled:opacity-60 ${isInCart
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-ink text-white hover:bg-ink-soft dark:bg-amber dark:hover:bg-amber-600"
        }`}
    >
      {isPending ? (
        <Loader2 size={15} className="animate-spin" />
      ) : isInCart ? (
        "✓  In Cart"
      ) : (
        "+ Add to Cart"
      )}
    </button>
  );
}

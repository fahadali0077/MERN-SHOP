"use client";

/**
 * ServerAddToCartButton — calls addToCart Server Action.
 *
 * This replaces the Zustand-based AddToCartButton on the product detail page.
 * Instead of updating client state, it calls a Server Action which:
 *   1. Reads the current cart from the session cookie (server)
 *   2. Adds the product
 *   3. Writes the updated cart back to the cookie
 *   4. Calls revalidatePath('/cart') to bust the cart page cache
 *
 * useTransition provides isPending for optimistic UI feedback.
 *
 * NOTE: On the /products grid, we still use the Zustand AddToCartButton
 * (fast client-side update, no page reload). On the detail page we use
 * this Server Action version to demonstrate the full module 6 pattern.
 * In a real app you'd pick one strategy and be consistent.
 */

import { useTransition, useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { addToCart } from "@/app/actions/cart";
import { cn } from "@/lib/utils";

interface ServerAddToCartButtonProps {
  productId: string;
  productName: string;
}

export function ServerAddToCartButton({ productId, productName }: ServerAddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    startTransition(async () => {
      const result = await addToCart(productId, 1);
      if (result.success) {
        setAdded(true);
        setTimeout(() => { setAdded(false); }, 2500);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={added ? `${productName} added to cart` : `Add ${productName} to cart`}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-base font-semibold transition-all disabled:opacity-60",
        added
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-ink text-white hover:bg-ink-soft hover:-translate-y-0.5 dark:bg-amber dark:hover:bg-amber-600",
      )}
    >
      {isPending ? (
        <><Loader2 size={18} className="animate-spin" /> Adding…</>
      ) : added ? (
        <><Check size={18} /> Added to Cart!</>
      ) : (
        <><ShoppingCart size={18} /> Add to Cart</>
      )}
    </button>
  );
}

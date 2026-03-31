"use client";



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

"use client";

import { useTransition } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { addToCart, removeFromCart } from "@/app/actions/cart";
import { useCartStore, type CartState } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { toast } from "@/stores/toastStore";
import { useAuthStore } from "@/stores/authStore";

interface AddToCartButtonProps {
  product: Product;
  size?: "default" | "lg";
}

/**
 * FIX #1/B12: ONE canonical add-to-cart button. The server cookie cart is the
 * source of truth (addToCart/removeFromCart server actions). The Zustand store is
 * only a UI mirror and is synced from the action's returned cart — no more dual
 * writes that drift. `ServerAddToCartButton` and `AddToCartActionButton` are
 * removed in favour of this.
 */
export function AddToCartButton({ product, size = "lg" }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const setItems = useCartStore((s: CartState) => s.setItems);
  const openDrawer = useCartStore((s: CartState) => s.openDrawer);
  const isInCart = useCartStore((s: CartState) => s.items.some((i) => i.product.id === product.id));
  const role = useAuthStore((s) => s.user?.role);

  // Admins cannot shop.
  if (role === "admin") return null;

  const handleClick = () => {
    startTransition(async () => {
      const result = isInCart ? await removeFromCart(product.id) : await addToCart(product.id, 1);
      if (result.success && result.data) {
        setItems(result.data.items); // single source-of-truth sync
        if (!isInCart) {
          openDrawer();
          toast.success("Added to cart", `${product.name} added!`);
        } else {
          toast.info("Removed from cart", `${product.name} removed.`);
        }
      } else {
        toast.error("Could not update cart", result.message);
      }
    });
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isPending}
      whileTap={{ scale: 0.98 }}
      aria-pressed={isInCart}
      aria-label={isInCart ? `Remove ${product.name} from cart` : `Add ${product.name} to cart`}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-60",
        size === "lg" ? "h-12 text-sm" : "h-10 text-sm",
        isInCart
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-ink text-white hover:bg-ink-soft dark:bg-amber dark:hover:bg-amber-600"
      )}
    >
      {isPending ? (
        <Loader2 size={15} className="animate-spin" />
      ) : isInCart ? (
        <><Check size={14} strokeWidth={2.5} /> In Cart · Remove</>
      ) : (
        <><ShoppingCart size={14} strokeWidth={2} /> Add to Cart</>
      )}
    </motion.button>
  );
}

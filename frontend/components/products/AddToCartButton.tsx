"use client";

import { useTransition } from "react";
import { ShoppingCart, Check, Loader2, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { addToCart, removeFromCart } from "@/app/actions/cart";
import { useCartStore, type CartState } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { toast } from "@/stores/toastStore";
import { useAuthStore } from "@/stores/authStore";

interface AddToCartButtonProps {
  product: Product;
  isInCartSession?: boolean;
  size?: "default" | "lg";
}

// Admins should not be able to add to cart
export function AddToCartButton({ product, isInCartSession = false, size = "lg" }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const addItemToStore    = useCartStore((s: CartState) => s.addItem);
  const removeItemFromStore = useCartStore((s: CartState) => s.removeItem);
  const openDrawer        = useCartStore((s: CartState) => s.openDrawer);
  const isInStore         = useCartStore((s: CartState) =>
    s.items.some((i: CartState["items"][number]) => i.product.id === product.id),
  );

  const isInCart = isInCartSession || isInStore;
  const role = useAuthStore((s) => s.user?.role);

  // Admins cannot shop — return nothing so the button simply doesn't appear
  if (role === "admin") return null;

  const handleClick = () => {
    startTransition(async () => {
      if (isInCart) {
        removeItemFromStore(product.id);
        const result = await removeFromCart(product.id);
        if (result.success) toast.info("Removed from cart", `${product.name} removed.`);
        else toast.error("Could not remove", result.message);
      } else {
        addItemToStore(product, 1);
        openDrawer();
        const result = await addToCart(product.id, 1);
        if (result.success) toast.success("Added to cart", `${product.name} added!`);
        else toast.error("Could not add to cart", result.message);
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
          : "bg-ink text-white hover:bg-ink-soft dark:bg-amber dark:hover:bg-amber-600",
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

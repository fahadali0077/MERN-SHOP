"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlistStore";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export function WishlistButton({ product, className }: WishlistButtonProps) {
  const toggle      = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product); }}
      aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      aria-pressed={isWishlisted}
      className={cn(
        "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white/90 backdrop-blur-sm transition-all hover:scale-105",
        isWishlisted
          ? "border-red-200 bg-red-50 text-red-500"
          : "text-ink-muted hover:border-red-200 hover:bg-red-50 hover:text-red-400",
        className,
      )}
    >
      <Heart size={13} strokeWidth={2} fill={isWishlisted ? "currentColor" : "none"} />
    </button>
  );
}

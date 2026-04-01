"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlistStore";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export function WishlistButton({ product, className }: WishlistButtonProps) {
  const toggle       = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const [popping, setPopping] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
    // Trigger heart pop animation
    setPopping(true);
    setTimeout(() => setPopping(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      aria-pressed={isWishlisted}
      className={cn(
        "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full",
        "border bg-white/90 backdrop-blur-sm",
        "transition-all duration-200",
        "hover:scale-110 active:scale-95",
        isWishlisted
          ? "border-red-200 bg-red-50 text-red-500 shadow-sm shadow-red-100"
          : "border-border text-ink-muted hover:border-red-200 hover:bg-red-50 hover:text-red-400",
        popping ? "wishlist-pop" : "",
        className,
      )}
    >
      <Heart
        size={13}
        strokeWidth={2}
        fill={isWishlisted ? "currentColor" : "none"}
        className="transition-transform duration-200"
      />
    </button>
  );
}

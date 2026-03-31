import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { StarRating } from "./StarRating";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { SHIMMER_BLUR, CARD_IMAGE_SIZES } from "@/lib/imageUtils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const BADGE_STYLES: Record<string, string> = {
  Sale: "bg-amber text-white",
  New:  "bg-ink text-white dark:bg-white dark:text-ink",
  Hot:  "bg-red-500 text-white",
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = product.originalPrice != null
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm ring-1 ring-black/[0.04] transition-all duration-150 ease-out hover:-translate-y-[2px] hover:shadow-lg dark:border-dark-border dark:bg-dark-surface dark:ring-white/[0.04]">

      {/* Badge */}
      {product.badge && (
        <div className="absolute left-3 top-3 z-10">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${BADGE_STYLES[product.badge] ?? "bg-ink text-white"}`}>
            {product.badge}
          </span>
        </div>
      )}

      {/* Wishlist */}
      <WishlistButton product={product} />

      {/* Image */}
      <Link href={`/products/${product.id}`} className="block" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-square overflow-hidden bg-cream dark:bg-dark-surface-2">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            placeholder="blur"
            blurDataURL={SHIMMER_BLUR}
            sizes={CARD_IMAGE_SIZES}
            className="object-cover transition-transform duration-500 ease-spring group-hover:scale-[1.04]"
          />
          {/* Amber bottom strip on hover */}
          <span className="absolute bottom-0 h-[3px] w-full origin-left scale-x-0 bg-amber transition-transform duration-300 group-hover:scale-x-100" />
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber">
          {product.category}
        </p>

        <Link href={`/products/${product.id}`} className="group/name">
          <h2 className="line-clamp-2 font-serif text-[0.95rem] leading-snug text-ink transition-colors group-hover/name:text-amber dark:text-white">
            {product.name}
          </h2>
        </Link>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        {/* Pricing */}
        <div className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-1">
          <span className="text-[1.05rem] font-bold tabular-nums text-ink dark:text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice != null && (
            <>
              <span className="text-xs tabular-nums text-ink-muted line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
              <span className="ml-auto rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                −{discount}%
              </span>
            </>
          )}
        </div>

        {/* Add to Cart — reveal on hover */}
        <div className="mt-3 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <AddToCartButton product={product} size="default" />
        </div>
      </div>
    </article>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { SHIMMER_BLUR } from "@/lib/imageUtils";
import type { Product } from "@/types";

interface FeaturedProductCardProps {
  product: Product;
  priority?: boolean;
}

const BADGE_BG: Record<string, string> = {
  Sale: "bg-amber",
  Hot:  "bg-red-600",
  New:  "bg-ink",
};

export function FeaturedProductCard({ product: p, priority = false }: FeaturedProductCardProps) {
  const discount = p.originalPrice
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
    : null;

  return (
    <Link
      href={`/products/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm ring-1 ring-black/[0.04] transition-all duration-150 ease-out hover:-translate-y-[2px] hover:shadow-lg dark:border-dark-border dark:bg-dark-surface dark:ring-white/[0.04]"
    >
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden bg-cream dark:bg-dark-surface-2">
        <Image
          src={p.image}
          alt={p.name}
          fill
          priority={priority}
          placeholder="blur"
          blurDataURL={SHIMMER_BLUR}
          sizes="(max-width: 640px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge */}
        {p.badge && (
          <span className={`absolute left-2.5 top-2.5 rounded-md px-2.5 py-0.5 text-[11px] font-semibold text-white ${BADGE_BG[p.badge] ?? "bg-ink"}`}>
            {p.badge}
          </span>
        )}
        {/* Amber bottom strip on hover */}
        <span className="absolute bottom-0 h-[3px] w-full origin-left scale-x-0 bg-amber transition-transform duration-300 group-hover:scale-x-100" />
        {/* Add to cart overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/70 py-2 text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Add to Cart
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber">
          {p.category}
        </p>
        <h3 className="line-clamp-2 font-serif text-sm leading-snug text-ink dark:text-white">
          {p.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-1.5 pt-2">
          {p.originalPrice ? (
            <>
              <span className="text-[1.05rem] font-bold tabular-nums text-amber-600">${p.price.toFixed(2)}</span>
              <span className="text-xs tabular-nums text-ink-muted line-through">
                ${p.originalPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-[1.05rem] font-bold tabular-nums text-ink dark:text-white">
              ${p.price.toFixed(2)}
            </span>
          )}
          {discount && (
            <span className="ml-auto text-[10px] font-bold text-green-700 dark:text-green-400">
              −{discount}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

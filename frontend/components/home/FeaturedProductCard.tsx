"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { SHIMMER_BLUR } from "@/lib/imageUtils";
import type { Product } from "@/types";

interface FeaturedProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
}

const BADGE_BG: Record<string, string> = {
  Sale: "bg-primary",
  Hot:  "bg-red-500",
  New:  "bg-ink",
};

export function FeaturedProductCard({ product: p, priority = false, index = 0 }: FeaturedProductCardProps) {
  const [hovered, setHovered] = useState(false);

  const discount = p.originalPrice
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.19, 1, 0.22, 1] }}
      whileHover={{ scale: 1.03, boxShadow: "0 20px 60px rgba(0,0,0,0.14)" }}
      style={{ borderRadius: "0.75rem" }}
    >
      <Link
        href={`/products/${p.id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="product-card group flex flex-col overflow-hidden rounded-xl border border-border bg-white ring-1 ring-black/[0.04] dark:border-dark-border dark:bg-dark-surface dark:ring-white/[0.04]"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-surface-raised dark:bg-dark-surface-2">
          <Image
            src={p.image}
            alt={p.name}
            fill
            priority={priority}
            placeholder="blur"
            blurDataURL={SHIMMER_BLUR}
            sizes="(max-width: 640px) 50vw, 33vw"
            className={[
              "object-cover transition-transform duration-500",
              hovered ? "scale-[1.07]" : "scale-100",
            ].join(" ")}
          />

          {p.badge && (
            <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm badge-entrance ${BADGE_BG[p.badge] ?? "bg-ink"}`}>
              {p.badge}
            </span>
          )}

          {discount && !p.badge && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm badge-entrance">
              -{discount}%
            </span>
          )}

          <span className="absolute bottom-0 h-[3px] w-full origin-left scale-x-0 bg-primary transition-transform duration-350 group-hover:scale-x-100" />

          <div
            className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-transparent to-transparent pb-3 transition-opacity duration-300"
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-ink backdrop-blur-sm">
              View Product
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            {p.category}
          </p>
          <h3 className="line-clamp-2 font-serif text-sm leading-snug text-ink transition-colors group-hover:text-primary dark:text-white dark:group-hover:text-primary-light">
            {p.name}
          </h3>
          <div className="mt-auto flex items-baseline gap-1.5 pt-2">
            {p.originalPrice ? (
              <>
                <span className="text-[1.05rem] font-bold tabular-nums text-primary">${p.price.toFixed(2)}</span>
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
              <span className="ml-auto rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                -{discount}%
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

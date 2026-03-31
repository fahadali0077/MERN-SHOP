"use client";

import Link from "next/link";
import { Heart, ArrowRight, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { FeaturedProductCard } from "@/components/home/FeaturedProductCard";

export default function WishlistPage() {
  const items  = useWishlistStore((s) => s.items);
  const clear  = useWishlistStore((s) => s.clear);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cream dark:bg-dark-surface">
          <Heart size={36} className="text-ink-muted" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">
            Your wishlist is empty
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Click the ♥ on any product to save it here
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft dark:bg-amber dark:hover:bg-amber-600"
        >
          Browse products <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="mb-10 flex items-end justify-between border-b border-border pb-8 dark:border-dark-border">
        <div>
          <h1 className="font-serif text-4xl font-normal tracking-tight text-ink dark:text-white md:text-5xl">
            My Wishlist
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {items.length} saved item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={clear}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
        >
          <Trash2 size={13} /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {items.map((product) => (
          <FeaturedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

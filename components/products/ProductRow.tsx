import { Suspense } from "react";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

interface ProductRowProps {
  products: Product[];
  rowIndex: number;
}

/**
 * ProductRow — one row of 4 product cards.
 *
 * Each row is wrapped in its own Suspense boundary.
 * The first row (rowIndex === 0) uses priority={true} on its cards
 * to preload images that are immediately visible (above the fold).
 *
 * MENTAL MODEL — per-row Suspense:
 *   A single <Suspense> wrapping the entire grid means ALL cards wait
 *   for the slowest one before any appear. Per-row Suspense means:
 *   - Row 1 renders as soon as its data is ready
 *   - Row 2 renders independently when its data is ready
 *   - The page progressively fills in, row by row
 *
 *   In practice with a single fetch() this doesn't change much — all
 *   cards come from one request. The pattern becomes significant when
 *   each card fetches its own data (e.g. inventory count from a separate
 *   service) — then each card or row streams independently.
 *
 *   This is Next.js "Streaming" — partial HTML sent progressively
 *   rather than waiting for the full page to be ready.
 */
export function ProductRow({ products, rowIndex }: ProductRowProps) {
  const isFirstRow = rowIndex === 0;

  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {products.map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={isFirstRow}  // only preload first row's images
          />
        ))}
      </div>
    </Suspense>
  );
}

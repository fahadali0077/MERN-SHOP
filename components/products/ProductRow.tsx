import { Suspense } from "react";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

interface ProductRowProps {
  products: Product[];
  rowIndex: number;
}


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

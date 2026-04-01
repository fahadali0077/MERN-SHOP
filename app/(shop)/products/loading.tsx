import { ProductGridSkeleton } from "@/components/products/ProductCardSkeleton";

export default function ProductsLoading() {
  return (
    <div>
      <div className="mb-10 border-b border-border pb-8 dark:border-dark-border">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-cream dark:bg-dark-surface" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-cream dark:bg-dark-surface" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}

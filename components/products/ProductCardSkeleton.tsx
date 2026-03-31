import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface">
      <Skeleton className="aspect-square w-full animate-pulse rounded-none bg-cream dark:bg-dark-surface-2" />
      <div className="flex flex-col gap-2.5 p-4">
        <Skeleton className="h-2.5 w-16 animate-pulse rounded-lg bg-cream dark:bg-dark-surface-2" />
        <Skeleton className="h-4 w-4/5 animate-pulse rounded-lg bg-cream dark:bg-dark-surface-2" />
        <Skeleton className="h-3 w-24 animate-pulse rounded-lg bg-cream dark:bg-dark-surface-2" />
        <Skeleton className="h-5 w-20 animate-pulse rounded-lg bg-cream dark:bg-dark-surface-2" />
        <Skeleton className="mt-1 h-10 w-full animate-pulse rounded-lg bg-cream dark:bg-dark-surface-2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

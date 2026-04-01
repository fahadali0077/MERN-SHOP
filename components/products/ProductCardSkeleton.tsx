/**
 * ProductCardSkeleton — Google Material-grade shimmer loading skeleton.
 * Uses the .skeleton class from globals.css for animated shimmer wave.
 */

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface">
      {/* Image area */}
      <div className="skeleton aspect-square w-full rounded-none" />

      <div className="flex flex-col gap-3 p-4">
        {/* Category label */}
        <div className="skeleton h-2.5 w-14 rounded-full" />
        {/* Product name */}
        <div className="skeleton h-4 w-4/5 rounded-lg" />
        <div className="skeleton h-4 w-3/5 rounded-lg" />
        {/* Stars */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-3 w-3 rounded-sm" />
          ))}
          <div className="skeleton ml-1 h-3 w-10 rounded-sm" />
        </div>
        {/* Price */}
        <div className="skeleton h-5 w-20 rounded-lg" />
        {/* CTA */}
        <div className="skeleton mt-1 h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 0.06}s` }}
          className="animate-fade-in"
        >
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/products/ProductCardSkeleton";
import { SearchBar } from "@/components/products/SearchBar";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse our complete collection of electronics, fashion, books, and more.",
};

interface Props {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div>
      <div className="mb-10 border-b border-border pb-8 dark:border-dark-border">
        <h1 className="font-serif text-4xl font-normal tracking-tight text-ink dark:text-white md:text-5xl">
          {params.category && params.category !== "All"
            ? params.category
            : "All Products"}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Browse our complete collection — new arrivals added weekly
        </p>
      </div>

      {/* SearchBar reads/writes URL params itself — no props needed */}
      <Suspense>
        <SearchBar />
      </Suspense>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid
          q={params.q}
          category={params.category}
          sort={params.sort}
        />
      </Suspense>
    </div>
  );
}

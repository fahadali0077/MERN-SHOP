import { fetchProducts, type FetchProductsOptions } from "@/lib/products";
import { ProductRow } from "./ProductRow";

/**
 * ProductGrid — async Server Component.
 *
 * Accepts optional search/filter params forwarded from the page's
 * searchParams prop. Products stream row-by-row via per-row Suspense
 * boundaries inside ProductRow.
 */

const ROW_SIZE = 4;

export async function ProductGrid(opts: FetchProductsOptions = {}) {
  const products = await fetchProducts(opts);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-2xl text-ink-soft dark:text-white">No products found</p>
        {(opts.q ?? opts.category) && (
          <p className="mt-2 text-sm text-ink-muted">
            Try clearing your search or choosing a different category.
          </p>
        )}
      </div>
    );
  }

  const rows: (typeof products)[] = [];
  for (let i = 0; i < products.length; i += ROW_SIZE) {
    rows.push(products.slice(i, i + ROW_SIZE));
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {rows.map((rowProducts, rowIndex) => (
        <ProductRow key={rowIndex} products={rowProducts} rowIndex={rowIndex} />
      ))}
    </div>
  );
}

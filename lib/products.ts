import { readFileSync } from "fs";
import { join } from "path";
import type { Product, Category, SortOption } from "@/types";

/**
 * lib/products.ts — data fetching layer (Server Components only).
 *
 * Reads the mock JSON directly from the filesystem at build time.
 * This avoids the circular HTTP fetch to localhost:3000 which breaks
 * during Vercel's static build phase (no server is running then).
 *
 * MERN-III swap: replace getProductsData() with a MongoDB query.
 * All function signatures stay the same — only the data source changes.
 */

export interface FetchProductsOptions {
  q?: string;
  category?: Category | "All" | string;
  sort?: SortOption | "featured" | string;
}

/** Raw data fetch — reads the static JSON file directly from disk. */
function getProductsData(): Product[] {
  const filePath = join(process.cwd(), "public", "api", "products.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Product[];
}

/** Apply filters and sorting in memory. */
function applyFilters(products: Product[], opts: FetchProductsOptions): Product[] {
  let list = [...products];

  if (opts.category && opts.category !== "All") {
    list = list.filter((p) => p.category === opts.category);
  }

  if (opts.q?.trim()) {
    const q = opts.q.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }

  switch (opts.sort) {
    case "price-asc":    list.sort((a, b) => a.price - b.price);            break;
    case "price-desc":   list.sort((a, b) => b.price - a.price);            break;
    case "rating-desc":  list.sort((a, b) => b.rating - a.rating);          break;
    case "reviews-desc": list.sort((a, b) => b.reviewCount - a.reviewCount); break;
    default: break; // "featured" — keep original order
  }

  return list;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchProducts(opts: FetchProductsOptions = {}): Promise<Product[]> {
  const data = getProductsData();
  return applyFilters(data, opts);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const products = getProductsData();
  return products.find((p) => p.id === id) ?? null;
}

export async function fetchProductIds(): Promise<string[]> {
  const products = getProductsData();
  return products.map((p) => p.id);
}

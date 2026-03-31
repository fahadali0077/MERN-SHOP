import type { Product, Category, SortOption } from "@/types";

/**
 * lib/products.ts — data fetching layer (Server Components only).
 *
 * ARCHITECTURE:
 *   This file reads the mock JSON directly (public/api/products.json)
 *   and applies filtering/sorting in memory.
 *
 *   The API Route (/api/products) also imports from here — so this file
 *   must NOT call the API route itself (would be a circular fetch).
 *
 *   MERN-III swap: replace getProductsData() with a MongoDB query.
 *   All function signatures stay the same — only the data source changes.
 *
 * FILTERING PARAMS:
 *   q        — full-text search (name, category, description)
 *   category — category filter
 *   sort     — sort order
 */

export interface FetchProductsOptions {
  q?: string;
  category?: Category | "All" | string;
  sort?: SortOption | "featured" | string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

/** Raw data fetch — reads the static JSON file. Cached by Next.js. */
async function getProductsData(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/api/products.json`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  return res.json() as Promise<Product[]>;
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
    case "price-asc":    list.sort((a, b) => a.price - b.price);           break;
    case "price-desc":   list.sort((a, b) => b.price - a.price);           break;
    case "rating-desc":  list.sort((a, b) => b.rating - a.rating);         break;
    case "reviews-desc": list.sort((a, b) => b.reviewCount - a.reviewCount); break;
    default: break; // "featured" — keep original order
  }

  return list;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchProducts(opts: FetchProductsOptions = {}): Promise<Product[]> {
  const data = await getProductsData();
  return applyFilters(data, opts);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const products = await getProductsData();
  return products.find((p) => p.id === id) ?? null;
}

export async function fetchProductIds(): Promise<string[]> {
  const products = await getProductsData();
  return products.map((p) => p.id);
}

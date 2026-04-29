import type { Product, Category, SortOption } from "@/types";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export interface FetchProductsOptions {
  q?: string;
  category?: Category | "All" | string;
  sort?: SortOption | "featured" | string;
  page?: number;
  limit?: number;
}

export async function fetchProducts(opts: FetchProductsOptions = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (opts.category && opts.category !== "All") params.set("category", opts.category);
  if (opts.sort && opts.sort !== "featured")    params.set("sort", opts.sort);
  if (opts.q?.trim())                           params.set("search", opts.q.trim());
  if (opts.page)                                params.set("page", String(opts.page));
  if (opts.limit)                               params.set("limit", String(opts.limit));

  try {
    const res = await fetch(`${API_URL}/api/v1/products?${params.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data: Product[] };
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data: Product };
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function fetchProductIds(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data: Product[] };
    return json.success ? json.data.map((p) => p.id).filter(Boolean) : [];
  } catch {
    return [];
  }
}

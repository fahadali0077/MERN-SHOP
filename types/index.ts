/**
 * types/index.ts — shared types for the whole stack.
 *
 * MENTAL MODEL — types vs schemas:
 *   Types (TypeScript):  compile-time only — erased at runtime.
 *   Schemas (Zod):       runtime validation — survives compilation.
 *
 *   We define types HERE as the single source of truth.
 *   Zod schemas in /schemas/ use z.infer<> to derive matching TS types,
 *   ensuring they never drift apart.
 *
 *   Flow:
 *     types/index.ts        → TypeScript types for IDE + tsc
 *     schemas/*.ts          → Zod schemas for runtime validation
 *     z.infer<typeof Schema> → TypeScript type derived FROM the Zod schema
 *
 *   In Module 8, ALL API route bodies and Server Action inputs are
 *   validated with Zod.safeParse() before any business logic runs.
 */

// ── Product ────────────────────────────────────────────────────────────────────
export type Category =
  | "Electronics"
  | "Fashion"
  | "Home & Kitchen"
  | "Books"
  | "Sports";

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly image: string;
  readonly rating: number;        // 0–5, one decimal
  readonly reviewCount: number;
  readonly category: Category;
  readonly badge?: "New" | "Sale" | "Hot";
  readonly originalPrice?: number;
  readonly description?: string;
}

// ── Cart ───────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  qty: number;
}

// ── User ───────────────────────────────────────────────────────────────────────
/**
 * User — the shape returned after authentication.
 * In MERN-IV this will be NextAuth.js's Session['user'] type.
 * We define it here so all auth-related code references one type.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: string; // ISO date string
  avatarUrl?: string;
}

// ── API Response wrapper ───────────────────────────────────────────────────────
/**
 * ApiResponse<T> — generic wrapper for all API Route responses.
 *
 * MENTAL MODEL:
 *   Every GET/POST/PUT/DELETE from our API returns this shape.
 *   Consumers can always check `success` before accessing `data`.
 *   This is a discriminated union — TypeScript narrows the type
 *   based on the `success` field.
 *
 *   Usage:
 *     const res: ApiResponse<Product[]> = await fetch(...).then(r => r.json())
 *     if (res.success) {
 *       res.data   // typed as Product[]
 *     } else {
 *       res.error  // typed as string
 *     }
 */
export type ApiResponse<T> =
  | { success: true;  data: T;     message?: string }
  | { success: false; error: string; code?: string };

// ── Server Action result ───────────────────────────────────────────────────────
/**
 * ActionResult — return type for all Server Actions.
 * Mirrors ApiResponse<T> but simpler — actions don't need full HTTP semantics.
 */
export interface ActionResult<T = void> {
  success: boolean;
  message: string;
  data?: T;
  fieldErrors?: Partial<Record<string, string[]>>;
}

// ── Sort ───────────────────────────────────────────────────────────────────────
export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "reviews-desc";

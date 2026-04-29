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
export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: string; // ISO date string
  avatarUrl?: string;
}

// ── API Response wrapper ───────────────────────────────────────────────────────
export type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string };

// ── Server Action result ───────────────────────────────────────────────────────
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

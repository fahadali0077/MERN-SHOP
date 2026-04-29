export type Category = "Electronics" | "Fashion" | "Home & Kitchen" | "Books" | "Sports";
export type Badge = "New" | "Sale" | "Hot";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: Category;
  badge?: Badge;
  originalPrice?: number;
  description?: string;
  stock: number;
}

export type ApiResponse<T> =
  | { success: true; data: T; message?: string; pagination?: Pagination }
  | { success: false; error: string; code?: string; details?: unknown };

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string };
    }
  }
}

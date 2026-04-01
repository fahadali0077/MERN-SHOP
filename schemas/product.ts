import { z } from "zod";
import type { Category } from "@/types";


export const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Books",
  "Sports",
] as const satisfies readonly Category[];

// ── ProductSchema — validates a full product object ────────────────────────────
export const ProductSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Name is required").max(200),
  price: z.number().positive("Price must be positive"),
  image: z.string().url("Image must be a valid URL"),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  category: z.enum(CATEGORIES, { message: "Invalid category" }),
  badge: z.enum(["New", "Sale", "Hot"]).optional(),
  originalPrice: z.number().positive().optional(),
  description: z.string().max(1000).optional(),
});

export type ProductSchemaType = z.infer<typeof ProductSchema>;

// ── CartItemSchema — validates a cart item ────────────────────────────────────
export const CartItemSchema = z.object({
  product: ProductSchema,
  qty: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1")
    .max(99, "Maximum quantity is 99"),
});

export type CartItemSchemaType = z.infer<typeof CartItemSchema>;

// ── AddToCartInputSchema — validates Server Action input ──────────────────────
export const AddToCartInputSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required")
    .regex(/^p-\d{3}$/, "Invalid product ID format"),
  qty: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(99, "Maximum quantity is 99")
    .default(1),
});

export type AddToCartInput = z.infer<typeof AddToCartInputSchema>;

// ── UpdateQtyInputSchema ──────────────────────────────────────────────────────
export const UpdateQtyInputSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(0).max(99), // 0 = remove
});

export type UpdateQtyInput = z.infer<typeof UpdateQtyInputSchema>;

// ── ProductsQuerySchema — validates GET /api/products query params ─────────────
export const ProductsQuerySchema = z.object({
  category: z.enum([...CATEGORIES, "All"] as [string, ...string[]]).optional(),
  sort: z.enum(["featured", "price-asc", "price-desc", "rating-desc", "reviews-desc"]).optional(),
  q: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;

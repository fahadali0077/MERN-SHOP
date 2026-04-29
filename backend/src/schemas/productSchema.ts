import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  price: z.number().positive("Price must be positive"),
  originalPrice: z.number().positive().optional(),
  image: z.string().url("Image must be a valid URL"),
  images: z.array(z.string().url()).optional(),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
  category: z.enum(["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports"], {
    required_error: "Category is required",
  }),
  badge: z.enum(["New", "Sale", "Hot"]).optional(),
  description: z.string().max(1000).optional(),
  stock: z.number().int().min(0).default(0),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

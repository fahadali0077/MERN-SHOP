import { Schema, model, type Document } from "mongoose";

// ── Interface — mirrors MERN-II frontend Product type ─────────────────────────
export interface IProduct extends Document {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  category: "Electronics" | "Fashion" | "Home & Kitchen" | "Books" | "Sports";
  badge?: "New" | "Sale" | "Hot";
  description?: string;
  stock: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name must be at most 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be non-negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price must be non-negative"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    images: [{ type: String }],
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating must be at most 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count must be non-negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports"],
        message: "Invalid category: {VALUE}",
      },
    },
    badge: {
      type: String,
      enum: {
        values: ["New", "Sale", "Hot"],
        message: "Invalid badge: {VALUE}",
      },
    },
    description: {
      type: String,
      maxlength: [1000, "Description must be at most 1000 characters"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock must be non-negative"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        // Map _id → id (matches MERN-II frontend Product.id: string)
        ret["id"] = (ret["_id"] as { toString(): string }).toString();
        delete ret["_id"];
        delete ret["__v"];
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Text index for search: GET /api/v1/products?search=headphones
productSchema.index({ name: "text", description: "text" });

// Compound index for common filter+sort queries
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, rating: -1 });

export const Product = model<IProduct>("Product", productSchema);

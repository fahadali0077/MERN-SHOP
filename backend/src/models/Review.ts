import { Schema, model, type Document, type Types } from "mongoose";

export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    comment: {
      type: String,
      maxlength: [500, "Comment must be at most 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret["id"] = (ret["_id"] as { toString(): string }).toString();
        delete ret["_id"];
        delete ret["__v"];
        return ret;
      },
    },
  }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// ── Auto recalculate product rating after review save / delete ────────────────
async function recalcProductRating(productId: Types.ObjectId): Promise<void> {
  const Review = model<IReview>("Review");

  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        avgRating:   { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]) as { avgRating: number; reviewCount: number }[];

  const avgRating   = stats[0]?.avgRating   ?? 0;
  const reviewCount = stats[0]?.reviewCount ?? 0;

  // Dynamic import avoids circular dependency
  const { Product } = await import("./Product.js");
  await Product.findByIdAndUpdate(productId, {
    rating:      Math.round(avgRating * 10) / 10,
    reviewCount,
  });
}

reviewSchema.post("save", function () {
  void recalcProductRating(this.product);
});

reviewSchema.post("findOneAndDelete", function (doc: IReview | null) {
  if (doc) void recalcProductRating(doc.product);
});

export const Review = model<IReview>("Review", reviewSchema);

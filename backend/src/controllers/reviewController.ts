import type { Request, Response } from "express";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

// ── POST /api/v1/products/:id/reviews ────────────────────────────────────────
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body as { rating: number; comment?: string };

  // Verify product exists
  const product = await Product.findById(req.params["id"]);
  if (!product) throw new AppError("Product not found", 404);

  // Check if user already reviewed this product
  const existing = await Review.findOne({
    product: req.params["id"],
    user: req.user!.userId,
  });
  if (existing) throw new AppError("You have already reviewed this product", 409);

  const review = await Review.create({
    product: req.params["id"],
    user:    req.user!.userId,
    rating,
    comment: comment ?? "",
  });

  // Populate user name for response
  await review.populate("user", "name avatarUrl");

  res.status(201).json({
    success: true,
    data: review,
    message: "Review submitted successfully",
  });
});

// ── GET /api/v1/products/:id/reviews ─────────────────────────────────────────
export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ product: req.params["id"] })
    .populate("user", "name avatarUrl")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: reviews, message: `${reviews.length} reviews` });
});

// ── DELETE /api/v1/products/:productId/reviews/:reviewId ─────────────────────
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findOneAndDelete({
    _id:     req.params["reviewId"],
    user:    req.user!.userId,   // only owner can delete
  });

  if (!review) throw new AppError("Review not found or not yours to delete", 404);

  res.json({ success: true, message: "Review deleted" });
});

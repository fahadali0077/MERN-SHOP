import type { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, sort, search, page = "1", limit = "12" } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (category && category !== "All") filter["category"] = category;
  if (search?.trim()) filter["$text"] = { $search: search.trim() };
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    "price-asc": { price: 1 }, "price-desc": { price: -1 },
    "rating-desc": { rating: -1 }, "reviews-desc": { reviewCount: -1 },
  };
  const sortQuery = sortMap[sort] ?? { createdAt: -1 };
  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip     = (pageNum - 1) * limitNum;
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortQuery).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(filter),
  ]);
  // lean() skips toJSON transform — manually map _id → id so frontend gets consistent shape
  const normalized = products.map(({ _id, __v, ...rest }) => ({ id: String(_id), ...rest }));
  res.json({ success: true, data: normalized, message: `${products.length} products`, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
});

export const getProductStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 }, avgPrice: { $avg: "$price" }, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 1, count: 1, avgPrice: { $round: ["$avgPrice", 2] }, minPrice: 1, maxPrice: 1 } },
  ]);
  res.json({ success: true, data: stats });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params["id"]).lean();
  if (!product) throw new AppError("Product not found", 404);
  const { _id, __v, ...rest } = product as typeof product & { __v?: number };
  res.json({ success: true, data: { id: String(_id), ...rest } });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.create(req.body as object);
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params["id"], req.body as object, { new: true, runValidators: true }).lean();
  if (!product) throw new AppError("Product not found", 404);
  const { _id, __v, ...rest } = product as typeof product & { __v?: number };
  res.json({ success: true, data: { id: String(_id), ...rest } });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params["id"]).lean();
  if (!product) throw new AppError("Product not found", 404);
  const { _id, __v, ...rest } = product as typeof product & { __v?: number };
  res.json({ success: true, data: { id: String(_id), ...rest } });
});

// ── POST /api/v1/products/:id/image — Cloudinary upload ──────────────────────
export const uploadProductImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("No file uploaded", 400);

  // Upload buffer to Cloudinary
  const imageUrl = await uploadToCloudinary(req.file.buffer, "mernshop/products");

  const product = await Product.findByIdAndUpdate(
    req.params["id"],
    { image: imageUrl },
    { new: true }
  ).lean();

  if (!product) throw new AppError("Product not found", 404);
  const { _id, __v, ...rest } = product as typeof product & { __v?: number };
  res.json({ success: true, data: { id: String(_id), ...rest }, message: "Image uploaded to Cloudinary" });
});

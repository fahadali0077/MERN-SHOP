import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

// ── GET /api/v1/users  (admin only) ──────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt((req.query["page"] as string) ?? "1", 10));
  const limit = Math.min(50, parseInt((req.query["limit"] as string) ?? "20", 10));
  const search = (req.query["search"] as string) ?? "";

  const filter = search
    ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter).select("-password -refreshToken -passwordResetToken -passwordResetExpires")
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ── GET /api/v1/users/:id  (admin only) ──────────────────────────────────────
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params["id"])
    .select("-password -refreshToken -passwordResetToken -passwordResetExpires")
    .lean();
  if (!user) throw new AppError("User not found", 404);

  // Fetch their order stats
  const [orderCount, totalSpent] = await Promise.all([
    Order.countDocuments({ user: user._id }),
    Order.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]).then((r) => (r[0] as { total: number } | undefined)?.total ?? 0),
  ]);

  res.json({ success: true, data: { ...user, orderCount, totalSpent } });
});

// ── PUT /api/v1/users/:id/role  (admin only) ──────────────────────────────────
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body as { role: string };
  const valid = ["customer", "admin", "moderator"];
  if (!valid.includes(role)) throw new AppError(`Role must be one of: ${valid.join(", ")}`, 400);

  // Prevent admin from demoting themselves
  if (req.params["id"] === req.user!.userId) throw new AppError("Cannot change your own role", 400);

  const user = await User.findByIdAndUpdate(req.params["id"], { role }, { new: true })
    .select("-password -refreshToken").lean();
  if (!user) throw new AppError("User not found", 404);

  res.json({ success: true, data: user, message: `Role updated to ${role}` });
});

// ── DELETE /api/v1/users/:id  (admin only) ────────────────────────────────────
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.params["id"] === req.user!.userId) throw new AppError("Cannot delete your own account", 400);

  const user = await User.findByIdAndDelete(req.params["id"]);
  if (!user) throw new AppError("User not found", 404);

  res.json({ success: true, message: "User deleted successfully" });
});

import type { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/User.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import { sendEmail, passwordResetHtml } from "../utils/email.js";

const REFRESH_COOKIE = {
  httpOnly: true, sameSite: "lax" as const,
  secure: process.env["NODE_ENV"] === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };
  if (await User.findOne({ email })) throw new AppError("Email already registered", 409);
  const user = await User.create({ name, email, password });
  const accessToken = signAccessToken(user.id as string, user.role);
  const refreshToken = signRefreshToken(user.id as string);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE);
  res.status(201).json({ success: true, data: { user, accessToken }, message: "Account created!" });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user || !(await (user as { comparePassword(p: string): Promise<boolean> }).comparePassword(password)))
    throw new AppError("Invalid email or password", 401);
  const accessToken = signAccessToken(user.id as string, user.role);
  const refreshToken = signRefreshToken(user.id as string);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE);
  res.json({ success: true, data: { user, accessToken }, message: "Welcome back!" });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = (req.cookies as Record<string, string>)?.["refreshToken"];
  if (!token) throw new AppError("No refresh token", 401);
  const { userId } = verifyRefreshToken(token);
  const user = await User.findById(userId).select("+refreshToken");
  if (!user || user.refreshToken !== token) throw new AppError("Invalid refresh token", 401);
  const newAccessToken = signAccessToken(user.id as string, user.role);
  const newRefreshToken = signRefreshToken(user.id as string);
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });
  res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE);
  res.json({ success: true, data: { accessToken: newAccessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = (req.cookies as Record<string, string>)?.["refreshToken"];
  if (token) await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId).lean();
  if (!user) throw new AppError("User not found", 404);
  res.json({ success: true, data: user });
});

// ── PATCH /api/v1/auth/me ─────────────────────────────────────────────────────
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body as { name?: string; email?: string };

  if (email) {
    const existing = await User.findOne({ email });
    if (existing && String(existing._id) !== req.user!.userId) {
      throw new AppError("Email already in use by another account", 409);
    }
  }

  const updated = await User.findByIdAndUpdate(
    req.user!.userId,
    { ...(name && { name }), ...(email && { email }) },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw new AppError("User not found", 404);
  res.json({ success: true, data: updated, message: "Profile updated" });
});

// ── POST /api/v1/auth/change-password ─────────────────────────────────────────
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  if (!currentPassword || !newPassword) throw new AppError("Both current and new password are required", 400);
  if (newPassword.length < 8) throw new AppError("New password must be at least 8 characters", 400);

  const user = await User.findById(req.user!.userId).select("+password");
  if (!user) throw new AppError("User not found", 404);

  const match = await (user as { comparePassword(p: string): Promise<boolean> }).comparePassword(currentPassword);
  if (!match) throw new AppError("Current password is incorrect", 401);

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password changed successfully" });
});

// ── POST /api/v1/auth/forgot-password ────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const user = await User.findOne({ email });

  // Always return 200 — don't reveal if email exists
  if (!user) {
    res.json({ success: true, message: "If that email exists, a reset link has been sent." });
    return;
  }

  const rawToken = (user as { createPasswordResetToken(): string }).createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env["FRONTEND_URL"] ?? "http://localhost:3000"}/auth/reset-password?token=${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "MERNShop — Reset Your Password",
      html: passwordResetHtml(resetUrl),
    });
    res.json({ success: true, message: "If that email exists, a reset link has been sent." });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError("Failed to send reset email. Please try again.", 500);
  }
});

// ── POST /api/v1/auth/reset-password ─────────────────────────────────────────
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }, // not expired
  }).select("+password");

  if (!user) throw new AppError("Reset token is invalid or has expired (10 min limit)", 400);

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  const accessToken = signAccessToken(user.id as string, user.role);
  const refreshToken = signRefreshToken(user.id as string);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE);
  res.json({ success: true, data: { accessToken }, message: "Password reset successful" });
});
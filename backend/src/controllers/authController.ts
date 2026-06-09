import type { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { Review } from "../models/Review.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import { sendEmail, passwordResetHtml, verificationEmailHtml } from "../utils/email.js";

const REFRESH_COOKIE = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env["NODE_ENV"] === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ── POST /api/v1/auth/register ─────────────────────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };
  if (await User.findOne({ email })) throw new AppError("Email already registered", 409);

  const user = await User.create({ name, email, password, isEmailVerified: false });

  const rawToken = (user as { createEmailVerifyToken(): string }).createEmailVerifyToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env["FRONTEND_URL"] ?? "http://localhost:3000"}/auth/verify-email?token=${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "MERNShop — Verify Your Email",
      html: verificationEmailHtml(user.name, verifyUrl),
    });
  } catch {
    console.error("[register] Failed to send verification email");
  }

  res.status(201).json({
    success: true,
    message: "Check your email to verify your account.",
    data: { email: user.email, name: user.name },
  });
});

// ── GET /api/v1/auth/verify-email?token=RAW ───────────────────────────────────
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.query["token"] as string | undefined;
  if (!rawToken) throw new AppError("Verification token is required", 400);

  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyExpires: { $gt: new Date() },
  }).select("+emailVerifyToken +emailVerifyExpires +refreshToken");

  if (!user) throw new AppError("Verification link is invalid or has expired (24h limit)", 400);

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;

  const accessToken = signAccessToken(user.id as string, user.role);
  const refreshToken = signRefreshToken(user.id as string);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE);
  // toJSON applies the transform → { id, name, email, role, ... } (secrets stripped)
  res.json({ success: true, data: { user: user.toJSON(), accessToken }, message: "Email verified! Welcome aboard." });
});

// ── POST /api/v1/auth/resend-verification ────────────────────────────────────
export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  if (!email) throw new AppError("Email is required", 400);

  const user = await User.findOne({ email }).select("+emailVerifyToken +emailVerifyExpires");

  if (!user || user.isEmailVerified) {
    res.json({ success: true, message: "If that email is registered and unverified, a new link has been sent." });
    return;
  }

  const rawToken = (user as { createEmailVerifyToken(): string }).createEmailVerifyToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env["FRONTEND_URL"] ?? "http://localhost:3000"}/auth/verify-email?token=${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "MERNShop — Verify Your Email (Resent)",
      html: verificationEmailHtml(user.name, verifyUrl),
    });
  } catch {
    throw new AppError("Failed to send verification email. Please try again.", 500);
  }

  res.json({ success: true, message: "If that email is registered and unverified, a new link has been sent." });
});

// ── POST /api/v1/auth/login ───────────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user || !(await (user as { comparePassword(p: string): Promise<boolean> }).comparePassword(password)))
    throw new AppError("Invalid email or password", 401);

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email before logging in.", 403);
  }

  const accessToken = signAccessToken(user.id as string, user.role);
  const refreshToken = signRefreshToken(user.id as string);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE);
  res.json({ success: true, data: { user: user.toJSON(), accessToken }, message: "Welcome back!" });
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

// ── GET /api/v1/auth/me ───────────────────────────────────────────────────────
// FIX #5: do NOT use .lean() — that bypasses the schema toJSON transform, so the
// response would contain `_id`/`__v` instead of `id` and the wrong shape.
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new AppError("User not found", 404);
  res.json({ success: true, data: user.toJSON() });
});

// ── PATCH /api/v1/auth/me ─────────────────────────────────────────────────────
// FIX #5 (shape) + FIX #6 (changing email must re-trigger verification).
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body as { name?: string; email?: string };

  const user = await User.findById(req.user!.userId).select("+emailVerifyToken +emailVerifyExpires");
  if (!user) throw new AppError("User not found", 404);

  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing && String(existing._id) !== req.user!.userId) {
      throw new AppError("Email already in use by another account", 409);
    }
    user.email = email;
    // FIX #6: new email is unverified until the user confirms it.
    user.isEmailVerified = false;
    const rawToken = (user as { createEmailVerifyToken(): string }).createEmailVerifyToken();

    const verifyUrl = `${process.env["FRONTEND_URL"] ?? "http://localhost:3000"}/auth/verify-email?token=${rawToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: "MERNShop — Verify Your New Email",
        html: verificationEmailHtml(user.name, verifyUrl),
      });
    } catch {
      console.error("[updateMe] Failed to send re-verification email");
    }
  }

  if (name) user.name = name;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: user.toJSON(),
    message: email && email !== user.email
      ? "Profile updated. Please verify your new email address."
      : "Profile updated",
  });
});

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

export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  await Promise.all([
    Order.deleteMany({ user: userId }),
    Review.deleteMany({ user: userId }),
    User.findByIdAndDelete(userId),
  ]);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.clearCookie("session");
  res.clearCookie("mern_cart");

  res.json({ success: true, message: "Account deleted successfully" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const user = await User.findOne({ email });

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

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
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

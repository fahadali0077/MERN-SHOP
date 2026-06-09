import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "./errorHandler.js";

// ── protect — verifies Bearer token, attaches req.user ───────────────────────
// FIX A1: never `throw` synchronously from plain middleware. Express 4 does not
// route synchronous throws here to the error handler — forward via next(err).
export const protect = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers["authorization"];
  if (!header?.startsWith("Bearer ")) {
    next(new AppError("No token provided. Please log in.", 401));
    return;
  }
  try {
    const token = header.split(" ")[1]!;
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError("Invalid or expired token. Please log in again.", 401));
  }
};

// ── authorize — role-based access control ────────────────────────────────────
export const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Not authenticated", 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(`Access denied. Required role: ${roles.join(" or ")}`, 403));
      return;
    }
    next();
  };

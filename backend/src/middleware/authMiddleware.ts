import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "./errorHandler.js";

// ── protect — verifies Bearer token, attaches req.user ───────────────────────
export const protect = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers["authorization"];
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("No token provided. Please log in.", 401);
  }
  try {
    const token = header.split(" ")[1]!;
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw new AppError("Invalid or expired token. Please log in again.", 401);
  }
};

// ── authorize — role-based access control ────────────────────────────────────
export const authorize = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required role: ${roles.join(" or ")}`,
        403
      );
    }
    next();
  };

import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  // Mongoose CastError — invalid ObjectId
  if (typeof err === "object" && err !== null && (err as {name?:string}).name === "CastError") {
    res.status(400).json({ success: false, error: "Invalid ID format", code: "INVALID_ID" });
    return;
  }
  // Duplicate key
  if (typeof err === "object" && err !== null && (err as {code?:number}).code === 11000) {
    const field = Object.keys((err as {keyValue?:Record<string,unknown>}).keyValue ?? {})[0];
    res.status(409).json({ success: false, error: `${field ?? "Field"} already exists`, code: "DUPLICATE_KEY" });
    return;
  }
  // Mongoose ValidationError
  if (typeof err === "object" && err !== null && (err as {name?:string}).name === "ValidationError") {
    const errors = Object.values((err as {errors:Record<string,{message:string}>}).errors).map(e => e.message);
    res.status(422).json({ success: false, error: errors.join(", "), code: "VALIDATION_ERROR" });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message, ...(process.env["NODE_ENV"] === "development" && { stack: err.stack }) });
    return;
  }
  console.error("💥 Unhandled error:", err);
  res.status(500).json({ success: false, error: process.env["NODE_ENV"] === "development" ? (err as Error)?.message ?? "Internal server error" : "Internal server error", code: "SERVER_ERROR" });
};

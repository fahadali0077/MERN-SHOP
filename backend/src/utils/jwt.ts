import jwt from "jsonwebtoken";

// FIX A6: fail loudly at startup instead of crashing on the first auth request.
// `process.env["X"]!` is a compile-time assertion only — it does NOT guarantee a
// runtime value, and `jwt.sign` with an undefined secret throws.
const ACCESS_SECRET = process.env["JWT_SECRET"];
const REFRESH_SECRET = process.env["JWT_REFRESH_SECRET"];

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  // Thrown at module load (server boot), with a clear, actionable message.
  throw new Error(
    "[jwt] Missing JWT_SECRET and/or JWT_REFRESH_SECRET environment variables. " +
      "Set both in your .env (see .env.example). The server cannot sign tokens without them."
  );
}

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export const signAccessToken = (userId: string, role: string): string =>
  jwt.sign({ userId, role }, ACCESS_SECRET, { expiresIn: "15m" });

export const signRefreshToken = (userId: string): string =>
  jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;

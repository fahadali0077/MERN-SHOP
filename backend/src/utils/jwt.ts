import jwt from "jsonwebtoken";

const ACCESS_SECRET  = process.env["JWT_SECRET"]!;
const REFRESH_SECRET = process.env["JWT_REFRESH_SECRET"]!;

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

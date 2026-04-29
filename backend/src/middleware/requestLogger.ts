import type { Request, Response, NextFunction } from "express";

const COLORS: Record<number, string> = {
  2: "\x1b[32m", // green  — 2xx
  3: "\x1b[36m", // cyan   — 3xx
  4: "\x1b[33m", // yellow — 4xx
  5: "\x1b[31m", // red    — 5xx
};
const RESET = "\x1b[0m";

function colorStatus(code: number): string {
  const color = COLORS[Math.floor(code / 100)] ?? RESET;
  return `${color}${code}${RESET}`;
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const method = req.method.padEnd(7);
    const status = colorStatus(res.statusCode);
    console.log(`  ${method} ${req.originalUrl} → ${status} (${ms}ms)`);
  });
  next();
};

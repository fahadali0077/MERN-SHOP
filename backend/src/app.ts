import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, message: { success: false, error: "Too many requests", code: "RATE_LIMITED" } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, error: "Too many auth attempts", code: "RATE_LIMITED" } });
app.use("/api/", limiter);
app.use("/api/v1/auth/", authLimiter);

const allowedOrigins = [process.env["FRONTEND_URL"] ?? "http://localhost:3000", "http://localhost:3000", "http://localhost:3001"];
app.use(cors({ origin: (o, cb) => { if (!o || allowedOrigins.includes(o)) return cb(null, true); cb(new Error("CORS")); }, credentials: true, methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

if (process.env["NODE_ENV"] !== "test") app.use(morgan("dev"));
app.use(requestLogger);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Swagger UI ─────────────────────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "MERNShop API Docs",
  swaggerOptions: { persistAuthorization: true },
}));

// ── Health check — used by Docker HEALTHCHECK + render ──────────────────────
app.get("/api/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? "ok" : "degraded",
    db: dbStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env["NODE_ENV"] ?? "development",
    module: "Module 9 — Production Deployment",
    docs: "/api/docs",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/users", userRoutes);

app.use((_req, res) => { res.status(404).json({ success: false, error: "Route not found", code: "NOT_FOUND" }); });
app.use(errorHandler);

export default app;

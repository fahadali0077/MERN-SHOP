import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = parseInt(process.env["PORT"] ?? "5000", 10);
const httpServer = http.createServer(app);

// ── Socket.IO setup ───────────────────────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log(`🔌  Socket connected: ${socket.id}`);

  socket.on("join:admin", () => {
    void socket.join("admin-room");
    console.log(`👑  Admin joined admin-room: ${socket.id}`);
  });

  socket.on("join:user", (userId: string) => {
    void socket.join(`user:${userId}`);
    console.log(`👤  User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌  Socket disconnected: ${socket.id}`);
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`\n🚀  MERNShop API — Module 7`);
    console.log(`   http://localhost:${PORT}/api/health`);
    console.log(`   ws://localhost:${PORT}  (Socket.IO)\n`);
  });
});

process.on("SIGTERM", () => { httpServer.close(() => process.exit(0)); });
process.on("unhandledRejection", (reason: unknown) => {
  console.error("💥 Unhandled Rejection:", reason);
  httpServer.close(() => process.exit(1));
});

export { httpServer };

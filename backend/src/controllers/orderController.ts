import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import { sendEmail, orderConfirmationHtml } from "../utils/email.js";

// io is imported lazily to avoid circular deps with server.ts
async function getIO() {
  const { io } = await import("../server.js");
  return io;
}

interface OrderItemInput { productId: string; qty: number; }

// ── POST /api/v1/orders ───────────────────────────────────────────────────────
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { items, shippingAddress } = req.body as {
    items: OrderItemInput[];
    shippingAddress?: { street: string; city: string; country: string };
  };

  if (!items?.length) throw new AppError("Order must contain at least one item", 400);

  const session = await mongoose.startSession();
  let order: InstanceType<typeof Order> | null = null;

  try {
    await session.withTransaction(async () => {
      const orderItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
        if (product.stock < item.qty)
          throw new AppError(`Insufficient stock for "${product.name}". Available: ${product.stock}`, 409);

        product.stock -= item.qty;
        await product.save({ session });

        orderItems.push({ product: product._id, name: product.name, image: product.image, price: product.price, qty: item.qty });
        totalAmount += product.price * item.qty;
      }

      const [created] = await Order.create(
        [{ user: req.user!.userId, items: orderItems, totalAmount, shippingAddress }],
        { session }
      );
      order = created ?? null;
    });
  } finally {
    session.endSession();
  }

  if (!order) throw new AppError("Order creation failed", 500);

  // ── Emit Socket.IO events ─────────────────────────────────────────────────
  try {
    const io = await getIO();
    // Notify admin dashboard
    io.to("admin-room").emit("newOrder", {
      order,
      timestamp: new Date().toISOString(),
    });
    // Notify the ordering user
    io.to(`user:${req.user!.userId}`).emit("orderConfirmed", {
      orderId: (order as { _id: unknown })._id,
      totalAmount: (order as { totalAmount: number }).totalAmount,
    });
  } catch {
    // Socket.IO failure must not break the order response
  }

  // ── Send confirmation email ───────────────────────────────────────────────
  try {
    const user = await User.findById(req.user!.userId).lean();
    if (user) {
      await sendEmail({
        to:      user.email,
        subject: `Order Confirmed — #${String((order as { _id: unknown })._id).slice(-8).toUpperCase()}`,
        html:    orderConfirmationHtml(user.name, order as Parameters<typeof orderConfirmationHtml>[1]),
      });
    }
  } catch (emailErr) {
    // Email failure must not break the order response
    console.error("⚠️  Order confirmation email failed:", emailErr);
  }

  res.status(201).json({ success: true, data: order, message: "Order placed successfully" });
});


// ── GET /api/v1/orders/:id ────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params["id"])
    .populate("user", "name email")
    .populate("items.product", "name image price")
    .lean();

  if (!order) throw new AppError("Order not found", 404);

  // Only allow owner or admin to view the order
  const userId = String((order as { user: unknown }).user);
  const isOwner = userId === req.user!.userId;
  const isAdmin = req.user!.role === "admin";
  if (!isOwner && !isAdmin) throw new AppError("Access denied", 403);

  res.json({ success: true, data: order });
});

// ── GET /api/v1/orders/my ─────────────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt((req.query["page"] as string) ?? "1", 10));
  const limit = Math.min(20, parseInt((req.query["limit"] as string) ?? "10", 10));

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user!.userId }).populate("items.product", "name image price").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments({ user: req.user!.userId }),
  ]);

  res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// ── GET /api/v1/orders ────────────────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await Order.find().populate("user", "name email").populate("items.product", "name price").sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: orders, message: `${orders.length} orders` });
});

// ── PUT /api/v1/orders/:id/status ─────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status: string };
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) throw new AppError(`Invalid status. Must be: ${validStatuses.join(", ")}`, 400);

  const order = await Order.findByIdAndUpdate(req.params["id"], { status }, { new: true, runValidators: true }).lean();
  if (!order) throw new AppError("Order not found", 404);

  // ── Emit status change to user ────────────────────────────────────────────
  try {
    const io = await getIO();
    const userId = String((order as { user: unknown }).user);
    io.to(`user:${userId}`).emit("orderStatusChanged", { orderId: req.params["id"], status });
  } catch { /* non-critical */ }

  res.json({ success: true, data: order, message: `Order status updated to ${status}` });
});

import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import * as ctrl from "../controllers/orderController.js";

const router = Router();

// All order routes require authentication
router.use(protect);

// Customer routes
router.post("/", ctrl.createOrder);           // place order (transaction)
router.get("/my", ctrl.getMyOrders);          // my orders (paginated)

// Admin routes
router.get("/", authorize("admin", "moderator"), ctrl.getAllOrders);
router.get("/:id", ctrl.getOrderById);              // get single order (owner or admin)
router.put("/:id/status", authorize("admin", "moderator"), ctrl.updateOrderStatus);

export default router;

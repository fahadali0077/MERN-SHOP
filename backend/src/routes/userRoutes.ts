import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import * as ctrl from "../controllers/userController.js";

const router = Router();

// All user-management routes require admin
router.use(protect, authorize("admin"));

router.get("/",           ctrl.getAllUsers);
router.get("/:id",        ctrl.getUserById);
router.put("/:id/role",   ctrl.updateUserRole);
router.delete("/:id",     ctrl.deleteUser);

export default router;

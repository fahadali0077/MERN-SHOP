import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import * as ctrl from "../controllers/userController.js";

const router = Router();

// FIX A4: the comment said "admin and moderator can see the user list" but the
// route was admin-only. Reads are now open to moderators too (matches intent and
// the moderator role added across the app). Writes stay admin-only.
router.get("/", protect, authorize("admin", "moderator"), ctrl.getAllUsers);
router.get("/:id", protect, authorize("admin", "moderator"), ctrl.getUserById);

// Role changes and deletion — admin only
router.put("/:id/role", protect, authorize("admin"), ctrl.updateUserRole);
router.delete("/:id", protect, authorize("admin"), ctrl.deleteUser);

export default router;

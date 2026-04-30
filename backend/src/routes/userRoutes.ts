import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import * as ctrl from "../controllers/userController.js";

const router = Router();

// View users — admin and moderator can see the user list
router.get("/",        protect, authorize("admin", "moderator"), ctrl.getAllUsers);
router.get("/:id",     protect, authorize("admin", "moderator"), ctrl.getUserById);

// Role changes and deletion — admin only
router.put("/:id/role",  protect, authorize("admin"), ctrl.updateUserRole);
router.delete("/:id",   protect, authorize("admin"), ctrl.deleteUser);

export default router;

import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/authMiddleware.js";
import { RegisterSchema, LoginSchema } from "../schemas/authSchema.js";
import * as ctrl from "../controllers/authController.js";

const router = Router();

router.post("/register",        validate(RegisterSchema), ctrl.register);
router.post("/login",           validate(LoginSchema),    ctrl.login);
router.post("/refresh",         ctrl.refresh);
router.post("/logout",          ctrl.logout);
router.get("/me",               protect, ctrl.getMe);
router.post("/forgot-password", ctrl.forgotPassword);
router.post("/reset-password",  ctrl.resetPassword);

export default router;

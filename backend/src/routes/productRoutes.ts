import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { CreateProductSchema, UpdateProductSchema } from "../schemas/productSchema.js";
import * as ctrl from "../controllers/productController.js";
import * as reviewCtrl from "../controllers/reviewController.js";

const router = Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: List products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [Electronics, Fashion, "Home & Kitchen", Books, Sports, All] }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [featured, price-asc, price-desc, rating-desc, reviews-desc] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12, maximum: 50 }
 *     responses:
 *       200:
 *         description: Paginated product list
 */
router.get("/", ctrl.getAllProducts);

/**
 * @swagger
 * /api/v1/products/stats:
 *   get:
 *     summary: Category stats (count + avg price)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Array of category stats
 */
router.get("/stats", ctrl.getProductStats);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product object
 *       404:
 *         description: Not found
 */
router.get("/:id", ctrl.getProductById);

/**
 * @swagger
 * /api/v1/products/{id}/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of reviews
 */
router.get("/:id/reviews", reviewCtrl.getProductReviews);

/**
 * @swagger
 * /api/v1/products/{id}/reviews:
 *   post:
 *     summary: Submit a review (authenticated)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string, maxLength: 500 }
 *     responses:
 *       201:
 *         description: Review created
 *       409:
 *         description: Already reviewed
 */
router.post("/:id/reviews", protect, reviewCtrl.createReview);
router.delete("/:id/reviews/:reviewId", protect, authorize("admin", "moderator"), reviewCtrl.deleteReview);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create product (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Created product
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       422:
 *         description: Validation error
 */
router.post("/", protect, authorize("admin"), validate(CreateProductSchema), ctrl.createProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update product (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", protect, authorize("admin", "moderator"), validate(UpdateProductSchema), ctrl.updateProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete product (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", protect, authorize("admin"), ctrl.deleteProduct);

/**
 * @swagger
 * /api/v1/products/{id}/image:
 *   post:
 *     summary: Upload product image to Cloudinary (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 */
router.post("/:id/image", protect, authorize("admin"), upload.single("image"), ctrl.uploadProductImage);

export default router;

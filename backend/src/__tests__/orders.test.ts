import request from "supertest";
import app from "../app.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";

process.env["JWT_SECRET"]         = "test-secret-32-chars-minimum-here!!";
process.env["JWT_REFRESH_SECRET"] = "test-refresh-32-chars-minimum-here!";
process.env["NODE_ENV"]           = "test";

async function getUserToken(): Promise<string> {
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({ name: "User", email: `user${Date.now()}@test.com`, password: "Password1" });
  return res.body.data.accessToken as string;
}

async function getAdminToken(): Promise<string> {
  const { User } = await import("../models/User.js");
  await User.create({ name: "Admin", email: `admin${Date.now()}@test.com`, password: "Password1", role: "admin" });
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: `admin${Date.now()}@test.com`, password: "Password1" });
  // Use registration instead for simplicity
  const regRes = await request(app)
    .post("/api/v1/auth/register")
    .send({ name: "Admin2", email: `admin2${Date.now()}@test.com`, password: "Password1" });
  return regRes.body.data.accessToken as string;
}

const sampleProduct = {
  name: "Test Product", price: 29.99,
  image: "https://placehold.co/400",
  category: "Electronics", stock: 5,
};

describe("Orders API", () => {
  describe("POST /api/v1/orders", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).post("/api/v1/orders").send({ items: [] });
      expect(res.status).toBe(401);
    });

    it("creates order and decrements stock atomically", async () => {
      const token = await getUserToken();
      const product = await Product.create(sampleProduct);

      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ items: [{ productId: product._id.toString(), qty: 2 }] });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAmount).toBe(29.99 * 2);

      // Verify stock was decremented
      const updated = await Product.findById(product._id);
      expect(updated!.stock).toBe(3); // 5 - 2
    });

    it("returns 409 when insufficient stock", async () => {
      const token = await getUserToken();
      const product = await Product.create({ ...sampleProduct, stock: 1 });

      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ items: [{ productId: product._id.toString(), qty: 5 }] });

      expect(res.status).toBe(409);

      // Stock must NOT have been decremented (transaction rolled back)
      const unchanged = await Product.findById(product._id);
      expect(unchanged!.stock).toBe(1);
    });

    it("returns 404 for non-existent product", async () => {
      const token = await getUserToken();
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ items: [{ productId: "000000000000000000000000", qty: 1 }] });
      expect(res.status).toBe(404);
    });

    it("returns 400 for empty items array", async () => {
      const token = await getUserToken();
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ items: [] });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/orders/my", () => {
    it("returns only current user orders", async () => {
      const token = await getUserToken();
      const product = await Product.create(sampleProduct);

      await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ items: [{ productId: product._id.toString(), qty: 1 }] });

      const res = await request(app)
        .get("/api/v1/orders/my")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe("GET /api/v1/orders (admin)", () => {
    it("returns 403 for regular user", async () => {
      const token = await getUserToken();
      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });
});

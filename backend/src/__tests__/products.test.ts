import request from "supertest";
import app from "../app.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

process.env["JWT_SECRET"]         = "test-secret-32-chars-minimum-here!!";
process.env["JWT_REFRESH_SECRET"] = "test-refresh-32-chars-minimum-here!";
process.env["NODE_ENV"]           = "test";

// Helper: register + login, return accessToken
async function getAdminToken(): Promise<string> {
  await User.create({
    name: "Admin", email: "admin@test.com",
    password: "Password1", role: "admin",
  });
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "admin@test.com", password: "Password1" });
  return res.body.data.accessToken as string;
}

async function getUserToken(): Promise<string> {
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({ name: "User", email: "user@test.com", password: "Password1" });
  return res.body.data.accessToken as string;
}

const sampleProduct = {
  name: "Test Headphones",
  price: 99.99,
  image: "https://placehold.co/400",
  rating: 4.5,
  reviewCount: 100,
  category: "Electronics",
  stock: 10,
};

describe("Products API", () => {
  // ── GET all ────────────────────────────────────────────────────────────────
  describe("GET /api/v1/products", () => {
    it("returns empty array when no products", async () => {
      const res = await request(app).get("/api/v1/products");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it("returns paginated products", async () => {
      await Product.insertMany([
        { ...sampleProduct, name: "Product A" },
        { ...sampleProduct, name: "Product B" },
        { ...sampleProduct, name: "Product C" },
      ]);
      const res = await request(app).get("/api/v1/products?limit=2&page=1");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.pages).toBe(2);
    });

    it("filters by category", async () => {
      await Product.insertMany([
        { ...sampleProduct, category: "Electronics" },
        { ...sampleProduct, name: "Fashion Item", category: "Fashion" },
      ]);
      const res = await request(app).get("/api/v1/products?category=Electronics");
      expect(res.status).toBe(200);
      expect(res.body.data.every((p: { category: string }) => p.category === "Electronics")).toBe(true);
    });

    it("sorts by price ascending", async () => {
      await Product.insertMany([
        { ...sampleProduct, name: "Expensive", price: 500 },
        { ...sampleProduct, name: "Cheap", price: 10 },
      ]);
      const res = await request(app).get("/api/v1/products?sort=price-asc");
      expect(res.body.data[0].price).toBe(10);
      expect(res.body.data[1].price).toBe(500);
    });
  });

  // ── GET stats ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/products/stats", () => {
    it("returns category aggregation", async () => {
      await Product.insertMany([
        { ...sampleProduct, category: "Electronics" },
        { ...sampleProduct, name: "Book", price: 15, category: "Books" },
      ]);
      const res = await request(app).get("/api/v1/products/stats");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty("_id");
      expect(res.body.data[0]).toHaveProperty("count");
    });
  });

  // ── GET by id ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/products/:id", () => {
    it("returns a product by id", async () => {
      const product = await Product.create(sampleProduct);
      const res = await request(app).get(`/api/v1/products/${product._id.toString()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(sampleProduct.name);
    });

    it("returns 404 for non-existent id", async () => {
      const res = await request(app).get("/api/v1/products/000000000000000000000000");
      expect(res.status).toBe(404);
    });

    it("returns 400 for invalid ObjectId format", async () => {
      const res = await request(app).get("/api/v1/products/not-an-id");
      expect(res.status).toBe(400);
    });
  });

  // ── POST create (admin) ────────────────────────────────────────────────────
  describe("POST /api/v1/products", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).post("/api/v1/products").send(sampleProduct);
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-admin user", async () => {
      const token = await getUserToken();
      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${token}`)
        .send(sampleProduct);
      expect(res.status).toBe(403);
    });

    it("admin creates product successfully", async () => {
      const token = await getAdminToken();
      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${token}`)
        .send(sampleProduct);
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe(sampleProduct.name);
      expect(res.body.data.id).toBeDefined();
    });

    it("returns 422 for invalid product data", async () => {
      const token = await getAdminToken();
      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "X", price: -1, category: "Invalid" });
      expect(res.status).toBe(422);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });
  });

  // ── PUT update (admin) ─────────────────────────────────────────────────────
  describe("PUT /api/v1/products/:id", () => {
    it("admin updates product", async () => {
      const token = await getAdminToken();
      const product = await Product.create(sampleProduct);
      const res = await request(app)
        .put(`/api/v1/products/${product._id.toString()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ price: 199.99 });
      expect(res.status).toBe(200);
      expect(res.body.data.price).toBe(199.99);
    });
  });

  // ── DELETE (admin) ─────────────────────────────────────────────────────────
  describe("DELETE /api/v1/products/:id", () => {
    it("admin deletes product", async () => {
      const token = await getAdminToken();
      const product = await Product.create(sampleProduct);
      const res = await request(app)
        .delete(`/api/v1/products/${product._id.toString()}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      const gone = await Product.findById(product._id);
      expect(gone).toBeNull();
    });
  });
});

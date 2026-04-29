import request from "supertest";
import app from "../app.js";

// Set required env vars before importing JWT utils
process.env["JWT_SECRET"]         = "test-secret-32-chars-minimum-here!!";
process.env["JWT_REFRESH_SECRET"] = "test-refresh-32-chars-minimum-here!";
process.env["NODE_ENV"]           = "test";

describe("Auth API", () => {
  const testUser = {
    name:     "Test User",
    email:    "test@example.com",
    password: "Password1",
  };

  // ── Register ───────────────────────────────────────────────────────────────
  describe("POST /api/v1/auth/register", () => {
    it("creates a new user and returns accessToken", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.password).toBeUndefined(); // never exposed
    });

    it("returns 409 if email already registered", async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
      const res = await request(app).post("/api/v1/auth/register").send(testUser);
      expect(res.status).toBe(409);
    });

    it("returns 422 for weak password (no uppercase)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "Test", email: "a@b.com", password: "nouppercase1" });
      expect(res.status).toBe(422);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    it("returns 422 for invalid email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "Test", email: "notanemail", password: "Password1" });
      expect(res.status).toBe(422);
    });
  });

  // ── Login ──────────────────────────────────────────────────────────────────
  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
    });

    it("returns accessToken + sets refreshToken cookie on valid credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("returns 401 for wrong password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: "WrongPass1" });
      expect(res.status).toBe(401);
    });

    it("returns 401 for non-existent email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "ghost@example.com", password: "Password1" });
      expect(res.status).toBe(401);
    });
  });

  // ── Protected route ────────────────────────────────────────────────────────
  describe("GET /api/v1/auth/me", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/v1/auth/me");
      expect(res.status).toBe(401);
    });

    it("returns current user with valid token", async () => {
      const reg = await request(app).post("/api/v1/auth/register").send(testUser);
      const token = reg.body.data.accessToken as string;

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it("returns 401 with invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid.token.here");
      expect(res.status).toBe(401);
    });
  });

  // ── Logout ─────────────────────────────────────────────────────────────────
  describe("POST /api/v1/auth/logout", () => {
    it("clears the refreshToken cookie", async () => {
      const res = await request(app).post("/api/v1/auth/logout");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

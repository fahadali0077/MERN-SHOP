/**
 * seedAdmin.ts — Creates an admin user in MongoDB
 * Usage: npm run db:admin
 *
 * FIX A9: credentials are read from env. The previous hardcoded
 * admin@mernshop.com / Admin@1234 was committed to the repo (and duplicated in a
 * now-deleted /api/auth/admin route), effectively publishing admin access.
 *
 * Set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME in .env.
 */

import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User.js";

const ADMIN_EMAIL = process.env["SEED_ADMIN_EMAIL"] ?? "admin@mernshop.com";
const ADMIN_PASSWORD = process.env["SEED_ADMIN_PASSWORD"] ?? "Admin@1234";
const ADMIN_NAME = process.env["SEED_ADMIN_NAME"] ?? "MERNShop Admin";

async function seedAdmin(): Promise<void> {
  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    console.error("❌  MONGODB_URI not set in .env");
    process.exit(1);
  }

  // Refuse to seed the well-known default password in production.
  if (process.env["NODE_ENV"] === "production" && ADMIN_PASSWORD === "Admin@1234") {
    console.error(
      "❌  Refusing to seed the default admin password in production. " +
        "Set SEED_ADMIN_PASSWORD to a strong value."
    );
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅  Connected\n");

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role === "admin") {
      console.log(`✅  Admin already exists: ${ADMIN_EMAIL}`);
    } else {
      existing.role = "admin";
      await existing.save({ validateBeforeSave: false });
      console.log(`✅  User upgraded to admin: ${ADMIN_EMAIL}`);
    }
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      isEmailVerified: true, // seeded admin can log in immediately
    });
    console.log(`✅  Admin user created: ${ADMIN_EMAIL}`);
    if (ADMIN_PASSWORD === "Admin@1234") {
      console.log(`\n⚠️   Using the default password. Change it immediately.`);
    }
  }

  await mongoose.disconnect();
  console.log("\n🔌  Done.");
}

seedAdmin().catch((err: unknown) => {
  console.error("❌  seedAdmin failed:", err);
  process.exit(1);
});

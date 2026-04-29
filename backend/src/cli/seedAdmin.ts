/**
 * seedAdmin.ts — Creates an admin user in MongoDB
 * Usage: npm run db:admin
 *
 * Creates: admin@mernshop.com / Admin@1234
 * Change credentials below before running in production.
 */

import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User.js";

const ADMIN_EMAIL    = "admin@mernshop.com";
const ADMIN_PASSWORD = "Admin@1234";
const ADMIN_NAME     = "MERNShop Admin";

async function seedAdmin(): Promise<void> {
  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    console.error("❌  MONGODB_URI not set in .env");
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
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role:     "admin",
    });
    console.log(`✅  Admin user created:`);
    console.log(`     Email:    ${ADMIN_EMAIL}`);
    console.log(`     Password: ${ADMIN_PASSWORD}`);
    console.log(`\n⚠️   Change this password immediately in production!`);
  }

  await mongoose.disconnect();
  console.log("\n🔌  Done.");
}

seedAdmin().catch((err: unknown) => {
  console.error("❌  seedAdmin failed:", err);
  process.exit(1);
});

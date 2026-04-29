/**
 * dbSeed.ts — Seeds MongoDB with products from products.json
 *
 * Run AFTER generating products.json with: npm run seed
 * Usage: npm run db:seed
 */

import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Product } from "../models/Product.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed(): Promise<void> {
  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    console.error("❌  MONGODB_URI not set in .env");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅  Connected\n");

  // Read products.json from project root
  const productsPath = path.join(__dirname, "../../products.json");
  let rawProducts: Record<string, unknown>[];

  try {
    const raw = await fs.readFile(productsPath, "utf-8");
    rawProducts = JSON.parse(raw) as Record<string, unknown>[];
  } catch {
    console.error(`❌  Could not read products.json at ${productsPath}`);
    console.error("    Run: npm run seed   first to generate it.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`📦  Found ${rawProducts.length} products in products.json`);

  // Clear existing products
  const deleted = await Product.deleteMany({});
  console.log(`🗑️   Cleared ${deleted.deletedCount} existing products`);

  // Remove any legacy id fields — MongoDB will assign _id
  const cleaned = rawProducts.map((p) => {
    const { id: _id, ...rest } = p as Record<string, unknown> & { id?: string };
    void _id;
    return rest;
  });

  // Insert all products
  const inserted = await Product.insertMany(cleaned);
  console.log(`✅  Seeded ${inserted.length} products into MongoDB\n`);

  // Print category breakdown
  const stats = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 }, avgPrice: { $avg: "$price" } } },
    { $sort: { _id: 1 } },
  ]) as { _id: string; count: number; avgPrice: number }[];

  console.log("📊  Category Breakdown:");
  console.table(
    stats.reduce<Record<string, string>>((acc, s) => {
      acc[s._id] = `${s.count} products — avg $${s.avgPrice.toFixed(2)}`;
      return acc;
    }, {})
  );

  await mongoose.disconnect();
  console.log("\n🔌  Disconnected. Seed complete!");
}

seed().catch((err: unknown) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});

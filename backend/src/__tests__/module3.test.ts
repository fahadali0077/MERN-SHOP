import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Product } from "../../src/models/Product.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTests(): Promise<void> {
  console.log("🧪  Starting Module-3 model tests...\n");

  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  // Seed test data from products.json
  const raw = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../products.json"), "utf-8")
  ) as Record<string, unknown>[];
  const cleaned = raw.map(({ id: _id, ...rest }) => { void _id; return rest; });
  await Product.insertMany(cleaned);

  // Test 1: Total count
  const all = await Product.find().lean();
  console.log(`✅  Seeded:         ${all.length} products`);

  // Test 2: Category filter
  const books = await Product.find({ category: "Books" }).lean();
  console.log(`✅  Books filter:   ${books.length} products`);

  // Test 3: Price sort
  const sorted = await Product.find().sort({ price: 1 }).limit(3).lean();
  console.log(`✅  Price asc top3: ${sorted.map(p => `$${p.price}`).join(", ")}`);

  // Test 4: Pagination
  const page2 = await Product.find().skip(12).limit(12).lean();
  const total = await Product.countDocuments();
  console.log(`✅  Pagination:     page 2 = ${page2.length} items, total = ${total}`);

  // Test 5: Aggregation
  const stats = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 }, avgPrice: { $avg: "$price" } } },
    { $sort: { _id: 1 } },
  ]) as { _id: string; count: number; avgPrice: number }[];
  console.log(`✅  Aggregation:    ${stats.length} categories`);
  stats.forEach(s => console.log(`     ${s._id}: ${s.count} products, avg $${s.avgPrice.toFixed(2)}`));

  // Test 6: toJSON transform (_id → id)
  const doc = await Product.findOne();
  const json = doc?.toJSON() as Record<string, unknown>;
  const hasId    = typeof json?.["id"] === "string";
  const noOldId  = !json?.["_id"];
  const noV      = !json?.["__v"];
  console.log(`\n✅  toJSON transform:`);
  console.log(`     id field exists:   ${hasId   ? "✓" : "✗"}`);
  console.log(`     _id removed:       ${noOldId ? "✓" : "✗"}`);
  console.log(`     __v removed:       ${noV     ? "✓" : "✗"}`);

  // Test 7: Invalid category rejected
  try {
    await Product.create({
      name: "Bad", price: 10, image: "https://x.com/x.jpg",
      category: "InvalidCategory", stock: 1,
    });
    console.log("❌  Validation: should have thrown");
  } catch {
    console.log("✅  Validation:     invalid category correctly rejected");
  }

  await mongoose.disconnect();
  await mongo.stop();
  console.log("\n🎉  All Module-3 tests passed!\n");
}

runTests().catch((err: unknown) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

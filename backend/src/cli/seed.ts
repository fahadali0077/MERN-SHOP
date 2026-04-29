import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Types ─────────────────────────────────────────────────────────────────────
type Category = "Electronics" | "Fashion" | "Home & Kitchen" | "Books" | "Sports";

interface RawProduct {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: Category;
  badge?: "New" | "Sale" | "Hot";
  description?: string;
  stock: number;
}

const VALID_CATEGORIES: Category[] = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Books",
  "Sports",
];

// ── Validation ────────────────────────────────────────────────────────────────
function validateProduct(obj: unknown, filename: string): RawProduct {
  if (typeof obj !== "object" || obj === null)
    throw new Error(`${filename}: root must be a JSON object`);

  const p = obj as Record<string, unknown>;

  if (typeof p["name"] !== "string" || p["name"].trim().length < 2)
    throw new Error(`${filename}: "name" must be a non-empty string (min 2 chars)`);

  if (typeof p["price"] !== "number" || p["price"] <= 0)
    throw new Error(`${filename}: "price" must be a positive number`);

  if (typeof p["image"] !== "string" || !p["image"].startsWith("http"))
    throw new Error(`${filename}: "image" must be a valid URL starting with http`);

  if (typeof p["rating"] !== "number" || p["rating"] < 0 || p["rating"] > 5)
    throw new Error(`${filename}: "rating" must be a number between 0 and 5`);

  if (typeof p["reviewCount"] !== "number" || p["reviewCount"] < 0)
    throw new Error(`${filename}: "reviewCount" must be a non-negative number`);

  if (!VALID_CATEGORIES.includes(p["category"] as Category))
    throw new Error(
      `${filename}: "category" must be one of: ${VALID_CATEGORIES.join(", ")}`
    );

  if (typeof p["stock"] !== "number" || p["stock"] < 0)
    throw new Error(`${filename}: "stock" must be a non-negative number`);

  return p as unknown as RawProduct;
}

// ── Summary Table ─────────────────────────────────────────────────────────────
function printSummary(products: RawProduct[], filterCategory: string | null): void {
  const categoryMap: Record<string, number> = {};
  let totalPrice = 0;

  for (const p of products) {
    categoryMap[p.category] = (categoryMap[p.category] ?? 0) + 1;
    totalPrice += p.price;
  }

  const avgPrice = products.length > 0 ? totalPrice / products.length : 0;

  console.log("\n📦  Seed Summary");
  console.log("─".repeat(52));
  console.table({
    "Total Products":  products.length,
    "Filter Applied":  filterCategory ?? "None (all categories)",
    "Avg Price ($)":   avgPrice.toFixed(2),
  });

  if (!filterCategory) {
    console.log("\n📊  Breakdown by Category:");
    console.table(categoryMap);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const filterIdx = args.indexOf("--filter");
  const filterCategory: string | null =
    filterIdx !== -1 ? (args[filterIdx + 1] ?? null) : null;

  // Validate filter if provided
  if (filterCategory && !VALID_CATEGORIES.includes(filterCategory as Category)) {
    console.error(
      `❌  Invalid category "${filterCategory}".\n    Valid options: ${VALID_CATEGORIES.join(", ")}`
    );
    process.exit(1);
  }

  const dataDir = path.join(__dirname, "../../data");

  // Read data directory
  let files: string[];
  try {
    files = await fs.readdir(dataDir);
  } catch {
    console.error(`❌  Cannot read data directory: ${dataDir}`);
    console.error("    Run this script from the project root.");
    process.exit(1);
  }

  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  if (jsonFiles.length === 0) {
    console.error("❌  No JSON files found in /data directory.");
    process.exit(1);
  }

  console.log(`🔍  Found ${jsonFiles.length} JSON file(s) in /data`);

  // Read all files concurrently with Promise.allSettled
  const results = await Promise.allSettled(
    jsonFiles.map(async (file) => {
      const raw = await fs.readFile(path.join(dataDir, file), "utf-8");
      const parsed: unknown = JSON.parse(raw);
      return validateProduct(parsed, file);
    })
  );

  // Separate successes from failures
  const products: RawProduct[] = [];
  let rejected = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      products.push(result.value);
    } else {
      rejected++;
      console.warn(`⚠️   ${(result.reason as Error).message}`);
    }
  }

  if (rejected > 0) {
    console.warn(`\n⚠️   ${rejected} file(s) failed validation and were skipped.\n`);
  }

  // Apply category filter
  const filtered = filterCategory
    ? products.filter((p) => p.category === filterCategory)
    : products;

  if (filtered.length === 0) {
    console.warn(
      filterCategory
        ? `⚠️   No products found for category "${filterCategory}".`
        : "⚠️   No valid products found."
    );
    process.exit(0);
  }

  // Write products.json to project root
  const outputPath = path.join(__dirname, "../../products.json");
  await fs.writeFile(outputPath, JSON.stringify(filtered, null, 2), "utf-8");

  printSummary(filtered, filterCategory);
  console.log(`\n✅  products.json written → ${outputPath}\n`);
}

main().catch((err: unknown) => {
  console.error("❌  Unexpected error:", err);
  process.exit(1);
});

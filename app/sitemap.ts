import type { MetadataRoute } from "next";
import { fetchProductIds } from "@/lib/products";
import { BASE_URL } from "@/lib/metadata";

/**
 * app/sitemap.ts — auto-generated XML sitemap.
 *
 * MENTAL MODEL:
 *   Next.js calls this file at build time and at runtime (ISR) to produce
 *   /sitemap.xml — the file search engines like Google read to discover
 *   all the pages on your site.
 *
 *   Without a sitemap: Google may miss pages, especially dynamically generated
 *   ones like /products/p-001 through /products/p-012.
 *
 *   With a sitemap: every product page is explicitly listed with:
 *     - url: the canonical URL
 *     - lastModified: when it was last updated (for cache freshness)
 *     - changeFrequency: hint to the crawler
 *     - priority: relative importance (1.0 = most important)
 *
 * VERIFICATION:
 *   After npm run build: visit http://localhost:3000/sitemap.xml
 *   You should see XML listing /, /products, and /products/p-001 ... /p-012.
 *
 * In production with MongoDB (MERN-III):
 *   Replace fetchProductIds() with a database query returning all product IDs.
 *   The sitemap auto-updates as products are added/removed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productIds = await fetchProductIds();

  const productEntries: MetadataRoute.Sitemap = productIds.map((id) => ({
    url: `${BASE_URL}/products/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    // Static routes — highest priority
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // Dynamic product pages
    ...productEntries,
  ];
}

import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/metadata";

/**
 * app/robots.ts — auto-generated robots.txt
 *
 * Next.js generates /robots.txt from this file at build time.
 * Tells crawlers which pages to index and where to find the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

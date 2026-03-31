import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

/**
 * next.config.ts — Module 7
 *
 * @next/bundle-analyzer:
 *   Wraps the Next.js build and outputs an interactive treemap of every
 *   JS bundle. Run: ANALYZE=true npm run build (or npm run analyze)
 *   Opens two HTML files: client.html and server.html showing bundle sizes.
 *
 *   What to look for:
 *   - Each route should only contain its own code (code splitting working)
 *   - framer-motion and other large libs should appear in shared chunks
 *   - Server Component pages should have ZERO or minimal client JS
 *
 * images.remotePatterns:
 *   Allowlist for next/image external sources.
 *   Picsum Photos provides our mock product images.
 */

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
    // Enable blur placeholder generation for remote images
    // (only works with local images natively; for remote we supply blurDataURL manually)
    formats: ["image/avif", "image/webp"],
  },
};

export default withBundleAnalyzer(nextConfig);

import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";


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

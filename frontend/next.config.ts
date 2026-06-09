import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // FIX #27: removed the "*.cloudinary.com" wildcard — Next's remotePatterns
      // hostname does not treat a leading "*." as a catch-all the way intended;
      // res.cloudinary.com (above) is the actual delivery host.
    ],
    formats: ["image/avif", "image/webp"],
  },
  reactStrictMode: true,
  // FIX #15: stop hiding type/lint errors. The codebase must compile cleanly.
  // (Re-enable temporarily ONLY if you need an emergency deploy, never long-term.)
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;

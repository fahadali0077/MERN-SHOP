import type { Metadata } from "next";
import type { Product } from "@/types";
import { env } from "@/env";


export const BASE_URL = env.NEXT_PUBLIC_BASE_URL;

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: env.NEXT_PUBLIC_APP_NAME,
    template: `%s | ${env.NEXT_PUBLIC_APP_NAME}`,
  },
  description: "Production-grade e-commerce frontend built with Next.js 15.",
  // ── Icons ──────────────────────────────────────────────────────────────────
  // Next.js picks up app/icon.tsx (32×32 PNG) and app/apple-icon.tsx (180×180)
  // automatically. The SVG entry below covers modern browsers that prefer vectors.
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png",    type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: env.NEXT_PUBLIC_APP_NAME,
    locale: "en_US",
    images: [{ url: "/og-image.jpg", width: 1200, height: 522, alt: "MERNShop" }],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: "/og-image.jpg", alt: "MERNShop" }],
  },
};

export function buildProductMetadata(product: Product): Metadata {
  const title = product.name;
  const description =
    product.description ??
    `Buy ${product.name} — ${product.category} — rated ${product.rating}/5.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: product.image, width: 600, height: 600, alt: product.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [product.image] },
  };
}

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
  openGraph: { type: "website", siteName: env.NEXT_PUBLIC_APP_NAME, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
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

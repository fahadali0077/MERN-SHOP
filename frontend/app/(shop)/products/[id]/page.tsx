import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { fetchProductById, fetchProductIds } from "@/lib/products";
import { buildProductMetadata } from "@/lib/metadata";
import { SHIMMER_BLUR, DETAIL_IMAGE_SIZES } from "@/lib/imageUtils";
import { StarRating } from "@/components/products/StarRating";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { ImageGallery } from "@/components/products/ImageGallery";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { ReviewsSection } from "@/components/products/ReviewsSection";
import { fetchReviews } from "@/app/actions/reviews";
import { getSessionUser } from "@/lib/session";

export async function generateStaticParams() {
  const ids = await fetchProductIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) return { title: "Product not found" };
  return buildProductMetadata(product);
}

const BADGE_STYLES: Record<string, string> = {
  Sale: "bg-amber text-white",
  New: "bg-ink text-white",
  Hot: "bg-red-500 text-white",
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, reviews, sessionUser] = await Promise.all([
    fetchProductById(id),
    fetchReviews(id),
    getSessionUser(),
  ]);
  if (!product) notFound();

  const discount = product.originalPrice != null
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="pb-16">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-ink-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink dark:hover:text-white">Home</Link>
        <ChevronRight size={13} className="text-border" />
        <Link href="/products" className="hover:text-ink dark:hover:text-white">Shop</Link>
        <ChevronRight size={13} className="text-border" />
        <span className="max-w-[180px] truncate text-ink dark:text-white">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
        {/* Image gallery */}
        <ImageGallery product={product} />

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Category + badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber">
              {product.category}
            </span>
            {product.badge && (
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${BADGE_STYLES[product.badge] ?? "bg-ink text-white"}`}>
                {product.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl font-normal leading-tight text-ink dark:text-white md:text-4xl">
            {product.name}
          </h1>

          <StarRating rating={product.rating} reviewCount={product.reviewCount} />

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold tabular text-ink dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice != null && (
              <>
                <span className="text-lg tabular text-ink-muted line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
                <span className="rounded-md bg-green-50 px-2 py-1 text-sm font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border dark:bg-dark-border" />

          {/* Description */}
          {product.description && (
            <p className="leading-relaxed text-ink-soft dark:text-ink-muted">
              {product.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-1">
            <AddToCartButton product={product} />
            <div className="flex gap-3">
              <WishlistButton
                product={product}
                className="static flex-1 h-10 rounded-lg border border-border bg-white text-ink-muted hover:border-red-300 hover:text-red-500 dark:border-dark-border dark:bg-dark-surface"
              />
              <Link
                href="/products"
                className="flex flex-1 items-center justify-center rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink-soft transition-all hover:border-ink hover:text-ink dark:border-dark-border dark:bg-dark-surface dark:text-white"
              >
                ← Back
              </Link>
            </div>
          </div>

          {/* JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: product.name,
                description: product.description ?? "",
                image: product.image,
                offers: { "@type": "Offer", price: product.price, priceCurrency: "USD", availability: "https://schema.org/InStock" },
                aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
              }),
            }}
          />
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection
        productId={id}
        initialReviews={reviews}
        isAuthenticated={!!sessionUser}
        isAdmin={sessionUser?.role === "admin"}
      />
    </div>
  );
}
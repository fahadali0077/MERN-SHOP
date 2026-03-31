import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Package, Cpu, Shirt, Home as HomeIcon, BookOpen, Dumbbell } from "lucide-react";
import { fetchProducts } from "@/lib/products";
import { SHIMMER_BLUR } from "@/lib/imageUtils";
import { CategoryCard } from "@/components/home/CategoryCard";
import { FeaturedProductCard } from "@/components/home/FeaturedProductCard";

export const metadata: Metadata = {
  title: "MERNShop — Modern E-Commerce",
  description: "Discover curated products across electronics, fashion, books, and more. Built with Next.js 15.",
  openGraph: {
    title: "MERNShop",
    description: "Discover curated products across electronics, fashion, books, and more.",
  },
};

// Category config — color + icon per category name
const CATEGORY_CONFIG: Record<string, { color: string; icon: string }> = {
  "Electronics":    { color: "#3B82F6", icon: "Cpu"      },
  "Fashion":        { color: "#EC4899", icon: "Shirt"     },
  "Home & Kitchen": { color: "#10B981", icon: "HomeIcon"  },
  "Books":          { color: "#F59E0B", icon: "BookOpen"  },
  "Sports":         { color: "#EF4444", icon: "Dumbbell"  },
};

export default async function HomePage() {
  const products   = await fetchProducts();
  const featured   = products.slice(0, 4);
  const categories = [...new Set(products.map((p) => p.category))];

  const stats = [
    { label: "PRODUCTS",   value: `${products.length}+` },
    { label: "CATEGORIES", value: `${categories.length}` },
    { label: "IN STOCK",   value: "100%"  },
    { label: "DELIVERY",   value: "24h"   },
  ];

  return (
    <div className="flex flex-col gap-20">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="grid gap-12 lg:grid-cols-[1fr_440px] lg:items-center">
        <div>
          {/* Free shipping pill */}
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber-dim px-3 py-1 text-xs font-semibold text-amber dark:bg-amber/10">
            <Zap size={11} strokeWidth={2.5} />
            Free shipping on orders over $50
          </div>

          <h1 className="animate-fade-up-1 mb-5 text-balance font-serif text-5xl font-normal leading-[1.08] tracking-tight text-ink dark:text-white md:text-6xl lg:text-[4rem]">
            Premium Products,<br />
            <span className="text-amber">Curated for You</span>
          </h1>

          <p className="animate-fade-up-2 mb-8 max-w-[440px] text-base leading-relaxed text-ink-soft dark:text-ink-muted md:text-lg">
            Shop from thousands of carefully selected products across electronics, fashion, books, and lifestyle — all in one place.
          </p>

          <div className="animate-fade-up-3 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-lg bg-ink px-7 py-3 text-[13px] font-semibold tracking-wide text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-ink-soft hover:shadow-md active:scale-[0.98] dark:bg-amber dark:hover:bg-amber-600"
            >
              Shop Now
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-7 py-3 text-[13px] font-semibold tracking-wide text-ink-soft shadow-xs transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-ink hover:text-ink hover:shadow-sm active:scale-[0.98] dark:border-dark-border dark:bg-dark-surface dark:text-white dark:hover:border-white"
            >
              Create Account
            </Link>
          </div>

          {/* Trust badges — stagger row 4 */}
          <div className="animate-fade-up-4 mt-10 flex flex-wrap items-center gap-6">
            {[
              { icon: ShieldCheck, label: "Secure Checkout" },
              { icon: Package,     label: "Easy Returns"    },
              { icon: Zap,         label: "Fast Delivery"   },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                <Icon size={14} className="text-amber" strokeWidth={2} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Featured product image grid — clean, no rotation */}
        <div className="grid grid-cols-2 gap-2.5">
          {featured.map((p, i) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className={[
                "group relative overflow-hidden border bg-cream shadow-md",
                "ring-1 ring-border dark:ring-dark-border",
                "dark:border-dark-border dark:bg-dark-surface-2",
                i === 0 ? "col-span-2 aspect-[2/1] rounded-2xl"
                        : "aspect-square rounded-2xl",
              ].join(" ")}
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                priority={i < 2}
                placeholder="blur"
                blurDataURL={SHIMMER_BLUR}
                sizes="(max-width: 768px) 90vw, 440px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-3 left-3 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-xs font-semibold text-white drop-shadow">{p.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface sm:grid-cols-4">
        {stats.map(({ label, value }, idx) => (
          <div
            key={label}
            className="flex flex-col items-center gap-0.5 px-6 py-6"
            style={{
              borderRight:
                idx < stats.length - 1
                  ? "1px solid rgba(0,0,0,0.08)"
                  : undefined,
            }}
          >
            <span
              className="font-serif text-4xl font-bold tabular-nums"
              style={{ color: "#C47F17" }}
            >
              {value}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl font-normal dark:text-white">Shop by Category</h2>
          <Link href="/products" className="text-sm font-semibold text-amber hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            const cfg   = CATEGORY_CONFIG[cat] ?? { color: "#C47F17", icon: "Package" };
            return (
              <CategoryCard
                key={cat}
                cat={cat}
                count={count}
                color={cfg.color}
                iconName={cfg.icon}
              />
            );
          })}
        </div>
      </section>

      {/* ── Featured products ────────────────────────────────────────────────── */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl font-normal dark:text-white">Featured Products</h2>
          <Link href="/products" className="text-sm font-semibold text-amber hover:underline">
            View all {products.length} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5">
          {products.slice(0, 6).map((p, i) => (
            <FeaturedProductCard key={p.id} product={p} priority={i < 2} />
          ))}
        </div>
      </section>

    </div>
  );
}

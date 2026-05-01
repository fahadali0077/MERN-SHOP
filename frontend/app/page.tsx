import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Package } from "lucide-react";
import { fetchProducts } from "@/lib/products";
import { SHIMMER_BLUR } from "@/lib/imageUtils";
import { CategoryCard } from "@/components/home/CategoryCard";
import { FeaturedProductCard } from "@/components/home/FeaturedProductCard";
import { ScrollRevealSection } from "@/components/home/ScrollRevealSection";
import { HeroCTA } from "@/components/home/HeroCTA";
import { StatsBar } from "@/components/home/StatsBar";

export const metadata: Metadata = {
  title: "MERNShop — Modern E-Commerce",
  description: "Discover curated products across electronics, fashion, books, and more. Built with Next.js 15.",
  openGraph: {
    title: "MERNShop",
    description: "Discover curated products across electronics, fashion, books, and more.",
  },
};

const CATEGORY_CONFIG: Record<string, { color: string; icon: string }> = {
  "Electronics":    { color: "#3B82F6", icon: "Cpu"      },
  "Fashion":        { color: "#EC4899", icon: "Shirt"     },
  "Home & Kitchen": { color: "#10B981", icon: "HomeIcon"  },
  "Books":          { color: "#F59E0B", icon: "BookOpen"  },
  "Sports":         { color: "#EF4444", icon: "Dumbbell"  },
};

export default async function HomePage() {
  const products   = await fetchProducts();
  const featured   = products.slice(0, 3);
  const categories = [...new Set(products.map((p) => p.category))];

  const stats = [
    { label: "Products",   value: products.length,     suffix: "+"  },
    { label: "Categories", value: categories.length,   suffix: ""   },
    { label: "In Stock",   value: 100,                 suffix: "%"  },
    { label: "Avg. Rating", value: 4.8,                suffix: "★"  },
  ];

  return (
    <div className="flex flex-col gap-24">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="hero-gradient-overlay relative grid gap-10 pt-8 pb-12 md:grid-cols-[1fr_420px] md:items-start md:gap-12 lg:grid-cols-[1fr_460px]">

        <div className="self-start">
          {/* Announcement pill */}
          <div className="animate-hero-5 mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-light px-3.5 py-1.5 text-xs font-semibold text-primary dark:border-primary/20 dark:bg-primary/10">
            <Zap size={11} strokeWidth={2.5} className="animate-pulse" />
            Free shipping on orders over $50
          </div>

          <h1 className="animate-hero-1 mb-5 text-balance font-serif text-5xl font-normal leading-[1.06] tracking-tight text-ink dark:text-white md:text-6xl lg:text-[4.2rem]">
            Shop Smarter,<br />
            <span className="relative text-primary">
              Live Better
              {/* Underline accent */}
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 300 8"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 5.5 Q75 2 150 5.5 Q225 9 298 5.5"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.5"
                />
              </svg>
            </span>
          </h1>

          <p className="animate-hero-2 mb-8 max-w-[460px] text-base leading-relaxed text-ink-soft dark:text-white/70 md:text-lg">
            Thousands of carefully selected products across electronics, fashion, books, and lifestyle — all in one beautifully fast store.
          </p>

          <HeroCTA />

          {/* Trust badges */}
          <div className="animate-hero-4 mt-10 flex flex-wrap items-center gap-6">
            {[
              { icon: ShieldCheck, label: "Secure Checkout" },
              { icon: Package,     label: "Easy Returns"    },
              { icon: Zap,         label: "Fast Delivery"   },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light">
                  <Icon size={12} className="text-primary" strokeWidth={2} />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Featured product image grid — hidden on mobile so text shows first */}
        <div className="hidden grid-cols-2 gap-3 self-start md:grid">
          {featured.map((p, i) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className={[
                "group relative overflow-hidden border border-border/60 bg-surface-raised shadow-md",
                "ring-1 ring-black/[0.04] transition-all duration-400 ease-expo-out",
                "hover:border-border hover:shadow-xl hover:ring-black/[0.07]",
                "dark:border-dark-border/60 dark:bg-dark-surface-2 dark:ring-white/[0.04]",
                i === 0 ? "col-span-2 aspect-[2/1] rounded-2xl" : "aspect-square rounded-2xl",
                i === 1 ? "hero-float" : "",
                i === 2 ? "hero-float-delayed" : "",
              ].join(" ")}
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                priority={i < 2}
                placeholder="blur"
                blurDataURL={SHIMMER_BLUR}
                sizes="(max-width: 768px) 90vw, (max-width: 1024px) 420px, 460px"
                className="object-cover transition-transform duration-600 ease-expo-out group-hover:scale-[1.06]"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {/* Product label */}
              <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-250 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="truncate text-xs font-semibold text-white drop-shadow">{p.name}</p>
                <p className="text-xs font-bold text-white/90 drop-shadow">${p.price.toFixed(2)}</p>
              </div>
              {/* Category chip */}
              <div className="absolute right-2.5 top-2.5 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-ink backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {p.category}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Animated stats bar ───────────────────────────────────────────────── */}
      <StatsBar stats={stats} />

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <ScrollRevealSection>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">Browse</p>
            <h2 className="font-serif text-3xl font-normal dark:text-white">Shop by Category</h2>
          </div>
          <Link href="/products" className="group flex items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5">
            View all
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat, i) => {
            const count = products.filter((p) => p.category === cat).length;
            const cfg   = CATEGORY_CONFIG[cat] ?? { color: "#6366f1", icon: "Package" };
            return (
              <div key={cat} className="reveal" style={{ transitionDelay: `${i * 0.07}s` }}>
                <CategoryCard
                  cat={cat}
                  count={count}
                  color={cfg.color}
                  iconName={cfg.icon}
                />
              </div>
            );
          })}
        </div>
      </ScrollRevealSection>

      {/* ── Featured products ────────────────────────────────────────────────── */}
      <ScrollRevealSection>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">Handpicked</p>
            <h2 className="font-serif text-3xl font-normal dark:text-white">Featured Products</h2>
          </div>
          <Link href="/products" className="group flex items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5">
            View all {products.length}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5">
          {products.slice(0, 6).map((p, i) => (
            <div key={p.id} className="reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
              <FeaturedProductCard product={p} priority={i < 2} />
            </div>
          ))}
        </div>
      </ScrollRevealSection>

      {/* ── Value proposition strip ──────────────────────────────────────────── */}
      <ScrollRevealSection>
        <div className="reveal rounded-2xl border border-primary/15 bg-primary-light px-8 py-10 dark:border-primary/20 dark:bg-primary/5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 font-serif text-2xl font-normal text-ink dark:text-white">
              Built for the modern shopper
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-ink-soft dark:text-white/70">
              Lightning-fast search, secure checkout, easy returns, and real-time order tracking — everything you need in one place.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lg active:scale-[0.97]"
            >
              Start Shopping <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </ScrollRevealSection>

    </div>
  );
}

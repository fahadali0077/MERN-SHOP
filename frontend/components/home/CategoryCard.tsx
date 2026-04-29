"use client";

import Link from "next/link";
import { Cpu, Shirt, Home as HomeIcon, BookOpen, Dumbbell, Package } from "lucide-react";
import type { ComponentType } from "react";

const ICON_MAP: Record<string, ComponentType<{ size?: number; color?: string }>> = {
  Cpu, Shirt, HomeIcon, BookOpen, Dumbbell, Package,
};

const CAT_STYLE: Record<string, { bg: string; iconColor: string; darkIconColor: string }> = {
  "Electronics": { bg: "cat-bg-electronics", iconColor: "#3b82f6", darkIconColor: "#60a5fa" },
  "Fashion": { bg: "cat-bg-fashion", iconColor: "#ec4899", darkIconColor: "#f472b6" },
  "Home & Kitchen": { bg: "cat-bg-home", iconColor: "#10b981", darkIconColor: "#34d399" },
  "Books": { bg: "cat-bg-books", iconColor: "#d97706", darkIconColor: "#fbbf24" },
  "Sports": { bg: "cat-bg-sports", iconColor: "#ef4444", darkIconColor: "#f87171" },
};

interface CategoryCardProps {
  cat: string;
  count: number;
  color: string;
  iconName: string;
}

export function CategoryCard({ cat, count, iconName }: CategoryCardProps) {
  const Icon = ICON_MAP[iconName] ?? Package;
  const style = CAT_STYLE[cat] ?? { bg: "cat-bg-default", iconColor: "#6366f1", darkIconColor: "#818cf8" };

  return (
    <Link
      href={`/products?category=${encodeURIComponent(cat)}`}
      className={[
        "group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-transparent px-4 py-6 text-center",
        "shadow-sm ring-1 ring-black/[0.05] transition-all duration-300 ease-expo-out",
        "hover:-translate-y-2 hover:border-border hover:shadow-lg hover:ring-black/[0.08]",
        "active:scale-[0.97]",
        "dark:ring-white/[0.06] dark:hover:ring-white/[0.12]",
        style.bg,
      ].join(" ")}
    >
      {/* Subtle radial highlight on hover */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.35) 0%, transparent 70%)" }}
      />

      {/* Icon container with color-matched bg */}
      <div
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{ backgroundColor: `${style.iconColor}20`, border: `1px solid ${style.iconColor}25` }}
      >
        <Icon size={24} color={style.iconColor} />
      </div>

      <div>
        <span className="block font-serif text-sm font-medium text-ink transition-colors group-hover:text-primary dark:text-white">
          {cat}
        </span>
        <span className="mt-0.5 block text-xs text-ink-muted">{count} items</span>
      </div>

      {/* Arrow — appears on hover */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 translate-x-2 text-ink-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}

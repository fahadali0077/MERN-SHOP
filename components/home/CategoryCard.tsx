"use client";

import Link from "next/link";
import { Cpu, Shirt, Home as HomeIcon, BookOpen, Dumbbell, Package } from "lucide-react";
import type { ComponentType } from "react";


const ICON_MAP: Record<string, ComponentType<{ size?: number; color?: string }>> = {
  Cpu, Shirt, HomeIcon, BookOpen, Dumbbell, Package,
};

interface CategoryCardProps {
  cat: string;
  count: number;
  color: string;
  iconName: string;
}

export function CategoryCard({ cat, count, color, iconName }: CategoryCardProps) {
  const Icon = ICON_MAP[iconName] ?? Package;

  return (
    <Link
      href={`/products?category=${encodeURIComponent(cat)}`}
      className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-white px-4 py-5 text-center shadow-sm ring-1 ring-black/[0.04] transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-dark-border dark:bg-dark-surface dark:ring-white/[0.04]"
    >
      {/* Icon container with 15% opacity fill background */}
      <div
        className="flex size-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}26` }}
      >
        <Icon size={22} color={color} />
      </div>
      <span className="font-serif text-sm font-normal text-ink transition-colors group-hover:text-amber dark:text-white">
        {cat}
      </span>
      <span className="text-xs text-ink-muted">{count} items</span>
    </Link>
  );
}

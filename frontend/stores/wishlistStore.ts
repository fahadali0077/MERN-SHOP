"use client";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { Product } from "@/types";

interface WishlistState {
  items: Product[];
  toggle: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  clear: () => void;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        toggle: (product) => set((s) => ({
          items: s.items.some((i) => i.id === product.id)
            ? s.items.filter((i) => i.id !== product.id)
            : [...s.items, product],
        }), false, "wishlist/toggle"),
        isWishlisted: (id) => get().items.some((i) => i.id === id),
        clear: () => set({ items: [] }, false, "wishlist/clear"),
        count: () => get().items.length,
      }),
      { name: "mernshop-wishlist", partialize: (s) => ({ items: s.items }) },
    ),
    { name: "WishlistStore" },
  ),
);

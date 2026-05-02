"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,

        addItem: (product, qty = 1) => {
          set((state) => {
            const existing = state.items.find((i) => i.product.id === product.id);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.product.id === product.id ? { ...i, qty: i.qty + qty } : i,
                ),
              };
            }
            return { items: [...state.items, { product, qty }] };
          }, false, "cart/addItem");
        },

        removeItem: (productId) => {
          set(
            (state) => ({ items: state.items.filter((i) => i.product.id !== productId) }),
            false, "cart/removeItem",
          );
        },

        updateQty: (productId, qty) => {
          if (qty <= 0) { get().removeItem(productId); return; }
          set(
            (state) => ({
              items: state.items.map((i) =>
                i.product.id === productId ? { ...i, qty } : i,
              ),
            }), false, "cart/updateQty",
          );
        },

        clearCart: () => set({ items: [] }, false, "cart/clearCart"),
        openDrawer: () => set({ isOpen: true }, false, "cart/openDrawer"),
        closeDrawer: () => set({ isOpen: false }, false, "cart/closeDrawer"),
        toggleDrawer: () => set((s) => ({ isOpen: !s.isOpen }), false, "cart/toggle"),
        totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
        totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.qty, 0),
      }),
      {
        name: "mernshop-cart",
        partialize: (s) => ({ items: s.items }), // don't persist drawer open state
      },
    ),
    { name: "CartStore" },
  ),
);

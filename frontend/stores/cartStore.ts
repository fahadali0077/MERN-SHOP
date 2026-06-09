"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

/**
 * FIX #1: the cart's single source of truth is the server cookie cart (mern_cart),
 * mutated exclusively via the cart server actions. This store is now a THIN,
 * NON-PERSISTED mirror used only for instant UI (navbar badge + drawer). It is
 * seeded once from GET /api/cart and then kept in sync from the values the cart
 * server actions return. It must never be persisted (no localStorage), otherwise
 * it would drift from the cookie again.
 */
export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;

  // Mirror sync (called by the hydrator and by components after server actions)
  setItems: (items: CartItem[]) => void;
  setHydrated: (v: boolean) => void;

  // Optimistic local mutations (UI only — server action is the real write)
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
    (set, get) => ({
      items: [],
      isOpen: false,
      hydrated: false,

      setItems: (items) => set({ items }, false, "cart/setItems"),
      setHydrated: (v) => set({ hydrated: v }, false, "cart/setHydrated"),

      addItem: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...state.items, { product, qty }] };
        }, false, "cart/addItem");
      },

      removeItem: (productId) =>
        set(
          (state) => ({ items: state.items.filter((i) => i.product.id !== productId) }),
          false,
          "cart/removeItem"
        ),

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set(
          (state) => ({
            items: state.items.map((i) => (i.product.id === productId ? { ...i, qty } : i)),
          }),
          false,
          "cart/updateQty"
        );
      },

      clearCart: () => set({ items: [] }, false, "cart/clearCart"),
      openDrawer: () => set({ isOpen: true }, false, "cart/openDrawer"),
      closeDrawer: () => set({ isOpen: false }, false, "cart/closeDrawer"),
      toggleDrawer: () => set((s) => ({ isOpen: !s.isOpen }), false, "cart/toggle"),
      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.qty, 0),
    }),
    { name: "CartStore" }
  )
);

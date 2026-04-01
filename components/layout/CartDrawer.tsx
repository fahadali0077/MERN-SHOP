"use client";

import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore, type CartState } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const isOpen = useCartStore((s: CartState) => s.isOpen);
  const items = useCartStore((s: CartState) => s.items);
  const closeDrawer = useCartStore((s: CartState) => s.closeDrawer);
  const removeItem = useCartStore((s: CartState) => s.removeItem);
  const updateQty = useCartStore((s: CartState) => s.updateQty);
  const clearCart = useCartStore((s: CartState) => s.clearCart);
  const totalPrice = useCartStore((s: CartState) => s.totalPrice());

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[420px] max-w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="flex items-center gap-3 font-serif text-2xl font-normal">
            Cart
            {items.length > 0 && (
              <span className="rounded-full bg-amber px-2 py-0.5 font-sans text-xs font-bold text-white">
                {items.length}
              </span>
            )}
          </h2>
          <button
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink-muted transition-colors hover:bg-border hover:text-ink"
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-12 text-center">
            <ShoppingBag size={48} className="text-border" />
            <p className="font-serif text-xl text-ink-soft">Your cart is empty</p>
            <p className="text-sm text-ink-muted">Add some products to get started.</p>
            <Button variant="outline" onClick={closeDrawer} asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <ul className="flex-1 overflow-y-auto divide-y divide-border/50 px-6">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="flex items-start gap-4 py-5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover bg-cream"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                    <p className="mt-1 text-sm font-bold text-ink">
                      ${(product.price * qty).toFixed(2)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded border border-border bg-cream text-ink hover:bg-border"
                        onClick={() => { updateQty(product.id, qty - 1); }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded border border-border bg-cream text-ink hover:bg-border"
                        onClick={() => { updateQty(product.id, qty + 1); }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                    onClick={() => { removeItem(product.id); }}
                    aria-label={`Remove ${product.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-border p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">Total</span>
                <span className="text-2xl font-bold tabular-nums text-ink">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <Button className="mb-3 w-full" size="lg">
                Proceed to Checkout →
              </Button>
              <Button
                variant="outline"
                className="w-full text-ink-muted hover:border-red-300 hover:text-red-600"
                onClick={clearCart}
              >
                Clear cart
              </Button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

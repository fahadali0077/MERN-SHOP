"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore, type CartState } from "@/stores/cartStore";

const spring = { type: "spring", damping: 28, stiffness: 300 };

export function AnimatedCartDrawer() {
  const isOpen     = useCartStore((s: CartState) => s.isOpen);
  const items      = useCartStore((s: CartState) => s.items);
  const closeDrawer= useCartStore((s: CartState) => s.closeDrawer);
  const removeItem = useCartStore((s: CartState) => s.removeItem);
  const updateQty  = useCartStore((s: CartState) => s.updateQty);
  const clearCart  = useCartStore((s: CartState) => s.clearCart);
  const total      = useCartStore((s: CartState) => s.totalPrice());

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={spring}
            className="fixed right-0 top-0 z-50 flex h-full w-[400px] max-w-full flex-col bg-white shadow-xl dark:bg-dark-surface"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 dark:border-dark-border">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={16} className="text-ink-soft dark:text-white" strokeWidth={2} />
                <h2 className="font-serif text-lg font-normal dark:text-white">
                  Cart
                </h2>
                {items.length > 0 && (
                  <span className="rounded-full bg-amber px-2 py-0.5 font-sans text-xs font-bold text-white">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-cream hover:text-ink dark:hover:bg-dark-surface-2 dark:text-white/60"
                aria-label="Close cart"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Empty */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream dark:bg-dark-surface-2">
                  <ShoppingBag size={28} className="text-ink-muted" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-serif text-lg dark:text-white">Your cart is empty</p>
                  <p className="mt-1 text-sm text-ink-muted">Add some products to get started</p>
                </div>
                <Link
                  href="/products"
                  onClick={closeDrawer}
                  className="mt-2 rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft dark:bg-amber dark:hover:bg-amber-600"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <>
                {/* Items */}
                <ul className="flex-1 divide-y divide-border/50 overflow-y-auto px-5 dark:divide-dark-border">
                  <AnimatePresence initial={false}>
                    {items.map(({ product, qty }) => (
                      <motion.li
                        key={product.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-start gap-3.5 py-4"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-16 w-16 flex-shrink-0 rounded-lg object-cover bg-cream"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink dark:text-white">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-sm font-bold tabular text-ink dark:text-white">
                            ${(product.price * qty).toFixed(2)}
                          </p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <button
                              onClick={() => { updateQty(product.id, qty - 1); }}
                              className="flex h-6 w-6 items-center justify-center rounded border border-border bg-cream text-ink hover:bg-border dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
                            >
                              <Minus size={10} strokeWidth={2.5} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold tabular dark:text-white">{qty}</span>
                            <button
                              onClick={() => { updateQty(product.id, qty + 1); }}
                              className="flex h-6 w-6 items-center justify-center rounded border border-border bg-cream text-ink hover:bg-border dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
                            >
                              <Plus size={10} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => { removeItem(product.id); }}
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                          aria-label={`Remove ${product.name}`}
                        >
                          <X size={13} strokeWidth={2} />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                {/* Footer */}
                <div className="border-t border-border p-5 dark:border-dark-border">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-ink-muted">Subtotal</span>
                    <motion.span
                      key={total}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      className="text-xl font-bold tabular dark:text-white"
                    >
                      ${total.toFixed(2)}
                    </motion.span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={closeDrawer}
                    className="block w-full rounded-lg bg-ink py-3 text-center text-sm font-semibold text-white transition-all hover:bg-ink-soft dark:bg-amber dark:hover:bg-amber-600"
                  >
                    Checkout
                  </Link>
                  <button
                    onClick={clearCart}
                    className="mt-2 w-full rounded-lg py-2 text-xs font-medium text-ink-muted hover:text-red-500 dark:text-white/50"
                  >
                    Clear cart
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

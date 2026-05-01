"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, ShoppingBag, ArrowLeft, ChevronRight } from "lucide-react";
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
  const router = useRouter();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, closeDrawer]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Swipe-to-close (touch) support
  const touchStartX = useRef<number | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (dx > 60) closeDrawer(); // swipe right → close
    touchStartX.current = null;
  };

  const handleCheckout = () => {
    closeDrawer();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        ref={panelRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-dark-surface sm:w-[420px] sm:max-w-full ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-4 dark:border-dark-border sm:px-6 sm:py-5">
          {/* Back / close — large touch target on mobile */}
          <button
            onClick={closeDrawer}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-surface-raised text-ink transition-colors hover:bg-border hover:text-ink dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:hidden"
            aria-label="Close cart"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>

          <h2 className="flex flex-1 items-center gap-2.5 font-serif text-xl font-normal text-ink dark:text-white sm:text-2xl">
            My Cart
            {items.length > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 font-sans text-xs font-bold text-white">
                {items.length}
              </span>
            )}
          </h2>

          {/* X close — desktop only (hidden on mobile where back arrow is shown) */}
          <button
            onClick={closeDrawer}
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-ink-muted transition-colors hover:bg-border hover:text-ink dark:bg-dark-surface-2 dark:text-white/60 sm:flex"
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Swipe hint (mobile only) ────────────────────────────────────── */}
        <div className="flex justify-center pt-2 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-border dark:bg-dark-border" />
        </div>

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised dark:bg-dark-surface-2">
              <ShoppingBag size={28} className="text-ink-muted/50 dark:text-white/20" />
            </div>
            <div>
              <p className="font-serif text-lg text-ink dark:text-white">Your cart is empty</p>
              <p className="mt-1 text-sm text-ink-muted">Add some products to get started.</p>
            </div>
            <Button variant="outline" onClick={closeDrawer} asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* ── Items list ─────────────────────────────────────────────── */}
            <ul className="flex-1 divide-y divide-border/50 overflow-y-auto px-4 dark:divide-dark-border/50 sm:px-6">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="flex items-start gap-3 py-4 sm:gap-4 sm:py-5">
                  {/* Image */}
                  <Link href={`/products/${product.id}`} onClick={closeDrawer}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-16 w-16 flex-shrink-0 rounded-xl object-cover bg-surface-raised sm:h-[72px] sm:w-[72px]"
                    />
                  </Link>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${product.id}`}
                      onClick={closeDrawer}
                      className="line-clamp-2 text-sm font-semibold text-ink transition-colors hover:text-primary dark:text-white"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-sm font-bold text-ink dark:text-white">
                      ${(product.price * qty).toFixed(2)}
                    </p>

                    {/* Qty stepper */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-ink transition-colors hover:bg-surface-raised disabled:opacity-40 dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
                        onClick={() => { updateQty(product.id, qty - 1); }}
                        disabled={qty <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} strokeWidth={2.5} />
                      </button>
                      <span className="w-7 text-center text-sm font-bold tabular-nums text-ink dark:text-white">
                        {qty}
                      </span>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-ink transition-colors hover:bg-surface-raised dark:border-dark-border dark:bg-dark-surface-2 dark:text-white"
                        onClick={() => { updateQty(product.id, qty + 1); }}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-ink-muted/50 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    onClick={() => { removeItem(product.id); }}
                    aria-label={`Remove ${product.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <div className="border-t border-border bg-white px-4 pb-6 pt-4 dark:border-dark-border dark:bg-dark-surface sm:px-6 sm:pb-8 sm:pt-5">
              {/* Subtotal */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-ink-muted dark:text-white/60">Subtotal</span>
                <span className="text-2xl font-bold tabular-nums text-ink dark:text-white">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Checkout CTA — big touch target */}
              <button
                onClick={handleCheckout}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-[15px] font-bold tracking-wide text-white shadow-sm shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-md active:scale-[0.98] sm:py-3.5"
              >
                Checkout
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* Clear cart */}
              <button
                onClick={clearCart}
                className="mt-3 w-full rounded-xl py-3 text-sm font-medium text-ink-muted transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
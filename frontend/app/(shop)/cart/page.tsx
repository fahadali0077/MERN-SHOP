import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { getSessionCart, getSessionCartTotal } from "@/lib/session";
import { RemoveButton, QtyStepper, ClearCartButton } from "@/components/cart/CartActions";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getSessionCart();
  const total = await getSessionCartTotal();

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cream dark:bg-dark-surface">
          <ShoppingBag size={36} className="text-ink-muted" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-normal text-ink dark:text-white">Your cart is empty</h1>
          <p className="mt-2 text-sm text-ink-muted">Add products to get started</p>
        </div>
        <Link href="/products" className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft dark:bg-amber dark:hover:bg-amber-600">
          Browse products <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="mb-10 border-b border-border pb-8 dark:border-dark-border">
        <h1 className="font-serif text-4xl font-normal tracking-tight text-ink dark:text-white md:text-5xl">
          My Cart
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {cart.length} item{cart.length !== 1 ? "s" : ""} · Session stored in HttpOnly cookie
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Items */}
        <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-white dark:divide-dark-border dark:border-dark-border dark:bg-dark-surface">
          {cart.map(({ product, qty }) => (
            <div key={product.id} className="flex items-center gap-4 p-5">
              <img src={product.image} alt={product.name}
                className="h-18 w-18 flex-shrink-0 rounded-lg object-cover bg-cream" style={{ height: 72, width: 72 }} />

              <div className="min-w-0 flex-1">
                <Link href={`/products/${product.id}`}
                  className="block truncate text-sm font-semibold text-ink hover:text-amber dark:text-white">
                  {product.name}
                </Link>
                <p className="mt-0.5 text-xs text-ink-muted">{product.category}</p>
                <p className="mt-1 text-sm font-medium text-ink-muted">${product.price.toFixed(2)} each</p>
              </div>

              <QtyStepper productId={product.id} currentQty={qty} />

              <span className="hidden w-20 text-right text-sm font-bold tabular text-ink dark:text-white sm:block">
                ${(product.price * qty).toFixed(2)}
              </span>

              <RemoveButton productId={product.id} productName={product.name} />
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="sticky top-24 rounded-xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
          <h2 className="mb-5 font-serif text-lg font-normal dark:text-white">Order Summary</h2>

          <div className="space-y-3">
            {cart.map(({ product, qty }) => (
              <div key={product.id} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-ink-soft dark:text-ink-muted">
                  {product.name} × {qty}
                </span>
                <span className="flex-shrink-0 font-medium tabular dark:text-white">
                  ${(product.price * qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-5 dark:border-dark-border">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-semibold dark:text-white">Total</span>
              <span className="text-2xl font-bold tabular dark:text-white">${total.toFixed(2)}</span>
            </div>

            <Link href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3 text-sm font-semibold text-white transition-all hover:bg-ink-soft dark:bg-amber dark:hover:bg-amber-600">
              Proceed to Checkout <ArrowRight size={14} />
            </Link>
            <ClearCartButton />
          </div>
        </aside>
      </div>
    </div>
  );
}

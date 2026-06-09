"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import { useCartStore, type CartState } from "@/stores/cartStore";
import { createOrderAction } from "@/app/actions/cart";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/stores/toastStore";
import type { CartItem } from "@/types";

function detectBrand(num: string): "visa" | "mastercard" | "amex" | null {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return null;
}

function CardBrandIcon({ brand }: { brand: "visa" | "mastercard" | "amex" | null }) {
  if (!brand) return <CreditCard size={20} className="text-ink-muted" />;
  const logos: Record<string, string> = { visa: "VISA", mastercard: "MC", amex: "AMEX" };
  const colors: Record<string, string> = { visa: "text-blue-600", mastercard: "text-red-500", amex: "text-green-600" };
  return <span className={`text-xs font-black tracking-widest ${colors[brand]}`}>{logos[brand]}</span>;
}

const CheckoutSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  address: z.string().min(5, "Address required"),
  city: z.string().min(2, "City required"),
  postalCode: z.string().min(4, "Postal code required"),
  cardNumber: z.string().regex(/^\d{16}$/, "16-digit card number required"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "MM/YY format required"),
  cvv: z.string().regex(/^\d{3,4}$/, "3–4 digit CVV required"),
});
type CheckoutValues = z.infer<typeof CheckoutSchema>;

export default function CheckoutPage() {
  const [placed, setPlaced] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [confirmedItems, setConfirmedItems] = useState<Array<{ name: string; price: number; qty: number }>>([]);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  // FIX #2: read the cart from the SAME server-seeded mirror the rest of the app
  // uses (the AuthHydrator seeds it from the cookie cart). The actual order write
  // happens server-side in createOrderAction, which re-reads the cookie cart, so
  // even if the mirror were briefly stale the order uses the authoritative source.
  const items = useCartStore((s: CartState) => s.items);
  const total = useCartStore((s: CartState) => s.totalPrice());
  const setItems = useCartStore((s) => s.setItems);
  const hydrated = useCartStore((s) => s.hydrated);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(CheckoutSchema),
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", address: "", city: "", postalCode: "", cardNumber: "", expiry: "", cvv: "" },
  });

  // Belt-and-suspenders: refresh the mirror from the server cart on mount.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { success: boolean; data?: CartItem[] } | null) => {
        if (!cancelled && j?.success && Array.isArray(j.data)) setItems(j.data);
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [setItems]);

  const formatCardNumber = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }, []);

  const formatExpiry = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }, []);

  const cardDisplay = form.watch("cardNumber");
  const brand = detectBrand(cardDisplay);

  const onSubmit = async (values: CheckoutValues) => {
    setOrderError(null);
    setProcessing(true);

    // Simulated payment latency.
    await new Promise((r) => setTimeout(r, 1200));

    const result = await createOrderAction({
      street: values.address,
      city: values.city,
      country: "PK",
    });

    if (!result.success || !result.data) {
      const msg =
        result.statusCode === 401
          ? "Your session has expired. Please sign in again."
          : result.message;
      setOrderError(msg);
      toast.error("Order failed", msg);
      setProcessing(false);
      return;
    }

    // Snapshot from the server's authoritative item list.
    setConfirmedItems(result.data.items.map((i) => ({ name: i.product.name, price: i.product.price, qty: i.qty })));
    setConfirmedTotal(result.data.totalAmount);
    setOrderId(result.data.id || null);
    setItems([]); // server already cleared the cookie cart
    setPlaced(true);
    setProcessing(false);
    toast.success("Order confirmed!", "Check your email for confirmation details.");
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-lg py-16">
        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <div className="mb-5 flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl font-normal dark:text-white">Order confirmed!</h1>
          <p className="mt-2 text-ink-muted">Thank you for your purchase. Your order is being processed.</p>
          {orderId && (
            <p className="mt-1 rounded-lg bg-surface-raised px-3 py-1.5 text-xs text-ink-muted inline-block dark:bg-dark-surface-2">
              Order ID: <span className="font-mono font-medium">{orderId}</span>
            </p>
          )}
          <div className="mt-6 rounded-xl border border-border dark:border-dark-border overflow-hidden text-left">
            <div className="bg-surface-raised dark:bg-dark-surface-2 px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Order Summary</p>
            </div>
            <div className="divide-y divide-border dark:divide-dark-border">
              {confirmedItems.map((item, idx) => (
                <div key={idx} className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-ink-soft dark:text-ink-muted">{item.name} × {item.qty}</span>
                  <span className="font-medium dark:text-white">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 font-semibold">
                <span className="dark:text-white">Total</span>
                <span className="text-lg dark:text-white">${confirmedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline" className="flex-1"><Link href="/account/orders">View Orders</Link></Button>
            <Button asChild className="flex-1"><Link href="/products">Continue Shopping</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  const cartEmpty = hydrated && items.length === 0;

  return (
    <div className="pb-16">
      <div className="mb-10 border-b border-border pb-8 dark:border-dark-border">
        <Link href="/cart" className="mb-4 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:hover:text-white">
          <ArrowLeft size={14} strokeWidth={2} /> Back to cart
        </Link>
        <h1 className="font-serif text-4xl font-normal tracking-tight text-ink dark:text-white md:text-5xl">Checkout</h1>
        <p className="mt-2 text-sm text-ink-muted">Complete your purchase securely</p>
      </div>

      {orderError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {orderError}
        </div>
      )}

      {cartEmpty && (
        <div className="mb-6 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-ink-muted dark:border-dark-border dark:bg-dark-surface-2">
          Your cart is empty. <Link href="/products" className="font-semibold text-primary hover:underline">Browse products</Link>.
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <Form {...form}>
          <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="space-y-6" noValidate>
            <div className="rounded-xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
              <h2 className="mb-5 font-serif text-lg font-normal dark:text-white">Shipping Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(["fullName", "email", "address", "city", "postalCode"] as const).map((name) => (
                  <FormField key={name} control={form.control} name={name} render={({ field }) => (
                    <FormItem className={name === "address" ? "sm:col-span-2" : ""}>
                      <FormLabel>
                        {name === "fullName" ? "Full Name" : name === "postalCode" ? "Postal Code" : name.charAt(0).toUpperCase() + name.slice(1)}
                      </FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-lg font-normal dark:text-white">Payment Details</h2>
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest">
                  <span className={brand === "visa" ? "text-blue-600" : "text-ink-muted/40 dark:text-white/20"}>VISA</span>
                  <span className={brand === "mastercard" ? "text-red-500" : "text-ink-muted/40 dark:text-white/20"}>MC</span>
                  <span className={brand === "amex" ? "text-green-600" : "text-ink-muted/40 dark:text-white/20"}>AMEX</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="cardNumber" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="4242 4242 4242 4242" inputMode="numeric" maxLength={19} className="pr-10"
                          value={formatCardNumber(field.value)}
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 16))} />
                        <div className="absolute inset-y-0 right-3 flex items-center"><CardBrandIcon brand={brand} /></div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="expiry" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" inputMode="numeric" maxLength={5}
                        value={formatExpiry(field.value)}
                        onChange={(e) => field.onChange(formatExpiry(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="cvv" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl><Input type="password" placeholder="•••" inputMode="numeric" maxLength={4} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/10">
                <ShieldCheck size={14} className="text-green-600 dark:text-green-400" strokeWidth={2} />
                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                  Secured by SSL — Your payment info is encrypted and never stored.
                </p>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={processing || items.length === 0}>
              {processing ? (<><Loader2 size={16} className="animate-spin" /> Processing payment…</>) : `Pay $${total.toFixed(2)}`}
            </Button>
          </form>
        </Form>

        <aside className="sticky top-24 rounded-xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
          <h2 className="mb-5 font-serif text-lg font-normal dark:text-white">Order Summary</h2>
          <div className="space-y-3">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-ink-soft dark:text-ink-muted">{product.name} × {qty}</span>
                <span className="font-medium tabular-nums dark:text-white">${(product.price * qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          {items.length === 0 && <p className="text-sm text-ink-muted">Your cart is empty.</p>}
          <div className="mt-5 border-t border-border pt-5 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <span className="font-semibold dark:text-white">Total</span>
              <span className="text-2xl font-bold tabular-nums dark:text-white">${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

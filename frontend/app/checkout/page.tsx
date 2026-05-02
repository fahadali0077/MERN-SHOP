"use client";

/**
 * MERN-III Module 6 — app/checkout/page.tsx
 * Wired to real backend: POST /api/v1/orders (MongoDB transaction)
 * Replaces the mock setTimeout with a real order creation.
 */

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, Lock, ArrowLeft } from "lucide-react";
import { useCartStore, type CartState } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/stores/toastStore";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

const CheckoutSchema = z.object({
  fullName:   z.string().min(2,  "Full name required"),
  email:      z.string().email(  "Valid email required"),
  address:    z.string().min(5,  "Address required"),
  city:       z.string().min(2,  "City required"),
  postalCode: z.string().min(4,  "Postal code required"),
  cardNumber: z.string().regex(/^\d{16}$/, "16-digit card number"),
  expiry:     z.string().regex(/^\d{2}\/\d{2}$/, "MM/YY format"),
  cvv:        z.string().regex(/^\d{3,4}$/, "3–4 digit CVV"),
});
type CheckoutValues = z.infer<typeof CheckoutSchema>;

export default function CheckoutPage() {
  const [placed, setPlaced] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const items     = useCartStore((s: CartState) => s.items);
  const total     = useCartStore((s: CartState) => s.totalPrice());
  const clearCart = useCartStore((s: CartState) => s.clearCart);
  const accessToken = useAuthStore((s) => s.accessToken);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(CheckoutSchema),
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", address: "", city: "", postalCode: "", cardNumber: "", expiry: "", cvv: "" },
  });

  const onSubmit = async (values: CheckoutValues) => {
    setOrderError(null);

    try {
      // POST to real backend — MongoDB transaction
      const res = await fetch(`${API}/api/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            qty: i.qty,
          })),
          shippingAddress: {
            street:  values.address,
            city:    values.city,
            country: "PK", // default country
          },
        }),
      });

      const data = await res.json() as { success: boolean; data?: { id?: string; _id?: string }; error?: string };

      if (!data.success) {
        const msg = data.error ?? "Order failed. Please try again.";
        setOrderError(msg);
        toast.error("Order failed", msg);
        return;
      }

      const id = data.data?.id ?? data.data?._id ?? null;
      setOrderId(id ? String(id) : null);
      clearCart();
      setPlaced(true);
      toast.success("Order confirmed!", "Check your email for confirmation details.");
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setOrderError(msg);
      toast.error("Order failed", msg);
    }
  };

  if (placed) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
          <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-normal dark:text-white">Order confirmed!</h1>
          <p className="mt-2 text-ink-muted">Thank you for your purchase. Your order is being processed.</p>
          {orderId && <p className="mt-1 text-xs text-ink-muted">Order ID: {orderId}</p>}
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline"><Link href="/account/orders">View Orders</Link></Button>
          <Button asChild><Link href="/products">Continue shopping</Link></Button>
        </div>
      </div>
    );
  }

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

      <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <Form {...form}>
          <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="space-y-6" noValidate>
            {/* Shipping */}
            <div className="rounded-xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
              <h2 className="mb-5 font-serif text-lg font-normal dark:text-white">Shipping</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(["fullName","email","address","city","postalCode"] as const).map((name) => (
                  <FormField key={name} control={form.control} name={name} render={({ field }) => (
                    <FormItem className={name === "address" ? "sm:col-span-2" : ""}>
                      <FormLabel>{name === "fullName" ? "Full Name" : name === "postalCode" ? "Postal Code" : name.charAt(0).toUpperCase() + name.slice(1)}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
              <h2 className="mb-5 font-serif text-lg font-normal dark:text-white">Payment</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="cardNumber" render={({ field }) => (
                  <FormItem className="sm:col-span-2"><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="1234567890123456" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="expiry" render={({ field }) => (
                  <FormItem><FormLabel>Expiry</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="cvv" render={({ field }) => (
                  <FormItem><FormLabel>CVV</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
                <Lock size={11} strokeWidth={2} /> Your payment information is encrypted and secure
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting || items.length === 0}>
              {form.formState.isSubmitting
                ? <><Loader2 size={16} className="animate-spin" /> Processing order…</>
                : `Pay $${total.toFixed(2)}`}
            </Button>
          </form>
        </Form>

        {/* Order Summary */}
        <aside className="sticky top-24 rounded-xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
          <h2 className="mb-5 font-serif text-lg font-normal dark:text-white">Order Summary</h2>
          <div className="space-y-3">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-ink-soft dark:text-ink-muted">{product.name} × {qty}</span>
                <span className="font-medium tabular dark:text-white">${(product.price * qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-5 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <span className="font-semibold dark:text-white">Total</span>
              <span className="text-2xl font-bold tabular dark:text-white">${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

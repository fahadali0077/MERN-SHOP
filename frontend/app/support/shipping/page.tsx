import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Truck, Clock, Globe, Package, MapPin, AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "Shipping Info" };

const SHIPPING_OPTIONS = [
  { name: "Standard Shipping", time: "5–7 business days", cost: "Free on orders over $50, otherwise $4.99", icon: Package },
  { name: "Express Shipping", time: "2–3 business days", cost: "$9.99 flat rate", icon: Truck },
  { name: "Next-Day Delivery", time: "1 business day", cost: "$19.99 — order before 12 PM", icon: Clock },
];

const COUNTRIES = [
  { region: "United States", time: "5–7 days", free: "$50+" },
  { region: "Canada", time: "7–10 days", free: "$75+" },
  { region: "United Kingdom", time: "7–12 days", free: "$75+" },
  { region: "European Union", time: "10–14 days", free: "$100+" },
  { region: "Australia / NZ", time: "10–16 days", free: "$100+" },
  { region: "Rest of World", time: "14–21 days", free: "N/A" },
];

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
        <ArrowLeft size={15} /> Back to Home
      </Link>

      <div className="mb-8">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Truck size={26} className="text-primary" />
        </div>
        <h1 className="font-serif text-3xl text-ink dark:text-white">Shipping Info</h1>
        <p className="mt-2 text-ink-muted">Everything you need to know about shipping, delivery times, and tracking.</p>
      </div>

      {/* Shipping options */}
      <h2 className="mb-4 font-semibold text-ink dark:text-white">Shipping Options</h2>
      <div className="mb-10 space-y-4">
        {SHIPPING_OPTIONS.map(({ name, time, cost, icon: Icon }) => (
          <div key={name} className="flex gap-4 rounded-xl border border-border bg-white p-5 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink dark:text-white">{name}</p>
              <p className="text-sm text-ink-muted">{time}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-ink dark:text-white">{cost}</p>
            </div>
          </div>
        ))}
      </div>

      {/* International shipping */}
      <h2 className="mb-4 font-semibold text-ink dark:text-white">
        <Globe size={15} className="mr-1.5 inline text-primary" />
        International Shipping
      </h2>
      <div className="mb-10 overflow-hidden rounded-xl border border-border dark:border-dark-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised dark:bg-dark-surface-2">
            <tr>
              {["Region", "Est. Delivery", "Free Shipping"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white dark:divide-dark-border dark:bg-dark-surface">
            {COUNTRIES.map(({ region, time, free }) => (
              <tr key={region} className="hover:bg-amber-50 dark:hover:bg-amber/5">
                <td className="px-4 py-3 font-medium text-ink dark:text-white">{region}</td>
                <td className="px-4 py-3 text-ink-muted">{time}</td>
                <td className="px-4 py-3 text-ink-muted">{free}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tracking */}
      <h2 className="mb-4 font-semibold text-ink dark:text-white">
        <MapPin size={15} className="mr-1.5 inline text-primary" />
        Order Tracking
      </h2>
      <div className="mb-8 rounded-xl border border-border bg-white p-5 dark:border-dark-border dark:bg-dark-surface">
        <p className="text-sm text-ink-muted">
          Once your order ships you will receive a confirmation email with a tracking number. You can use this number on the carrier's website or view your order status under{" "}
          <Link href="/account/orders" className="font-semibold text-primary hover:underline">Account → Orders</Link>.
          Tracking updates may take up to 24 hours to appear after dispatch.
        </p>
      </div>

      {/* Note */}
      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
        <p className="text-sm text-ink-muted">
          Delivery times are estimates and may be affected by customs clearance, public holidays, or carrier delays outside our control.
        </p>
      </div>
    </div>
  );
}

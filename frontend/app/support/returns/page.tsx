import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Clock, Package, AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "Returns & Refunds" };

const ELIGIBLE = [
  "Item received in wrong size or color",
  "Product arrived damaged or defective",
  "Item not as described on the product page",
  "Wrong item shipped",
  "Unused item in original packaging within 30 days",
];

const NOT_ELIGIBLE = [
  "Items returned after 30 days of delivery",
  "Products showing signs of use or damage caused by customer",
  "Perishable goods or consumables",
  "Digital downloads and gift cards",
  "Customised or personalised items",
];

const STEPS = [
  { icon: Package, step: "1", title: "Initiate Return", desc: "Go to Account → Orders, find your order and click 'Request Return'. Select the item(s) and reason." },
  { icon: RotateCcw, step: "2", title: "Pack & Ship", desc: "Use the prepaid return label we email you. Pack the item securely in its original packaging if possible." },
  { icon: Clock, step: "3", title: "Processing", desc: "Once we receive your return it is inspected within 2 business days. We'll email you the result." },
  { icon: CheckCircle, step: "4", title: "Refund Issued", desc: "Approved refunds are processed within 5–7 business days back to your original payment method." },
];

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
        <ArrowLeft size={15} /> Back to Home
      </Link>

      <div className="mb-8">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <RotateCcw size={26} className="text-primary" />
        </div>
        <h1 className="font-serif text-3xl text-ink dark:text-white">Returns &amp; Refunds</h1>
        <p className="mt-2 text-ink-muted">We offer a hassle-free 30-day return policy on most items.</p>
      </div>

      {/* Policy summary banner */}
      <div className="mb-8 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-white dark:divide-dark-border dark:border-dark-border dark:bg-dark-surface">
        {[
          { label: "Return Window", value: "30 Days" },
          { label: "Refund Method", value: "Original Payment" },
          { label: "Processing Time", value: "5–7 Business Days" },
        ].map(({ label, value }) => (
          <div key={label} className="px-5 py-4 text-center">
            <p className="text-base font-bold text-primary">{value}</p>
            <p className="text-xs text-ink-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Steps */}
      <h2 className="mb-4 font-semibold text-ink dark:text-white">How to Return an Item</h2>
      <div className="mb-10 space-y-4">
        {STEPS.map(({ icon: Icon, step, title, desc }) => (
          <div key={step} className="flex gap-4 rounded-xl border border-border bg-white p-5 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {step}
            </div>
            <div>
              <p className="font-semibold text-ink dark:text-white">{title}</p>
              <p className="mt-0.5 text-sm text-ink-muted">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Eligible / Not eligible */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="mb-3 flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
            <CheckCircle size={16} /> Eligible for Return
          </div>
          <ul className="space-y-2">
            {ELIGIBLE.map((e) => (
              <li key={e} className="flex items-start gap-2 text-sm text-ink-muted">
                <span className="mt-0.5 text-green-500">✓</span> {e}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-900/10">
          <div className="mb-3 flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
            <XCircle size={16} /> Not Eligible
          </div>
          <ul className="space-y-2">
            {NOT_ELIGIBLE.map((e) => (
              <li key={e} className="flex items-start gap-2 text-sm text-ink-muted">
                <span className="mt-0.5 text-red-400">✗</span> {e}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Note */}
      <div className="mt-8 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
        <p className="text-sm text-ink-muted">
          For damaged or defective items, please include a photo when submitting your return request. This helps us resolve your case faster.
        </p>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-ink-muted">Have a question about your specific order?</p>
        <Link href="/support/contact" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          Contact Support →
        </Link>
      </div>
    </div>
  );
}

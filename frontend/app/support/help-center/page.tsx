import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search, ShoppingBag, Truck, RotateCcw, CreditCard, User, Package, Shield, MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Help Center" };

const TOPICS = [
  {
    icon: ShoppingBag,
    title: "Orders & Purchases",
    desc: "How to place, modify, or cancel an order.",
    articles: ["How do I place an order?", "Can I change my order after placing it?", "How do I cancel an order?", "What payment methods are accepted?"],
  },
  {
    icon: Truck,
    title: "Shipping & Delivery",
    desc: "Estimated delivery times, tracking, and more.",
    articles: ["How long does shipping take?", "How do I track my package?", "Do you ship internationally?", "What if my package is lost?"],
  },
  {
    icon: RotateCcw,
    title: "Returns & Refunds",
    desc: "Our 30-day hassle-free return policy.",
    articles: ["How do I return an item?", "When will I receive my refund?", "What items are not returnable?", "How do I exchange an item?"],
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    desc: "Payment methods, invoices, and billing issues.",
    articles: ["What payment methods are accepted?", "Is my payment information secure?", "How do I get an invoice?", "Why was my payment declined?"],
  },
  {
    icon: User,
    title: "Account & Settings",
    desc: "Managing your profile, password, and preferences.",
    articles: ["How do I create an account?", "How do I reset my password?", "How do I update my email?", "How do I delete my account?"],
  },
  {
    icon: Package,
    title: "Products & Stock",
    desc: "Product information, availability, and sizing.",
    articles: ["How do I know if an item is in stock?", "Where can I find size guides?", "Are product photos accurate?", "Can I request a product?"],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="mx-auto max-w-4xl py-10">
      {/* Back */}
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
        <ArrowLeft size={15} /> Back to Home
      </Link>

      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <MessageCircle size={26} className="text-primary" />
        </div>
        <h1 className="font-serif text-3xl text-ink dark:text-white">Help Center</h1>
        <p className="mt-2 text-ink-muted">Find answers to common questions or contact our support team.</p>

        {/* Search bar (visual) */}
        <div className="mx-auto mt-6 flex max-w-md items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <Search size={16} className="text-ink-muted" />
          <input
            type="text"
            placeholder="Search help articles…"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted dark:text-white"
          />
        </div>
      </div>

      {/* Topics grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map(({ icon: Icon, title, desc, articles }) => (
          <div key={title} className="rounded-xl border border-border bg-white p-5 dark:border-dark-border dark:bg-dark-surface">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon size={18} className="text-primary" />
            </div>
            <h2 className="font-semibold text-ink dark:text-white">{title}</h2>
            <p className="mt-1 text-xs text-ink-muted">{desc}</p>
            <ul className="mt-4 space-y-2">
              {articles.map((a) => (
                <li key={a}>
                  <span className="cursor-pointer text-sm text-ink-muted hover:text-primary transition-colors">
                    → {a}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Still need help */}
      <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center dark:bg-primary/10">
        <Shield size={28} className="mx-auto mb-3 text-primary" />
        <h3 className="font-semibold text-ink dark:text-white">Still need help?</h3>
        <p className="mt-1 text-sm text-ink-muted">Our support team typically responds within 24 hours.</p>
        <Link
          href="/support/contact"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ShoppingBag, Github, Linkedin, Mail, Phone, MapPin, CreditCard, Shield, RotateCcw, Truck } from "lucide-react";

const LINKS = {
  Shop: [
    { href: "/products", label: "All Products" },
    { href: "/products?category=Electronics", label: "Electronics" },
    { href: "/products?category=Fashion", label: "Fashion" },
    { href: "/products?category=Books", label: "Books" },
    { href: "/products?category=Sports", label: "Sports" },
  ],
  Account: [
    { href: "/auth/login", label: "Sign In" },
    { href: "/auth/register", label: "Create Account" },
    { href: "/account", label: "My Account" },
    { href: "/account/orders", label: "Track My Order" },
    { href: "/cart", label: "Shopping Cart" },
  ],
  Support: [
    { href: "#", label: "Help Center" },
    { href: "#", label: "Returns & Refunds" },
    { href: "#", label: "Shipping Info" },
    { href: "#", label: "Size Guide" },
    { href: "#", label: "Contact Us" },
  ],
};

const TRUST_BADGES = [
  { icon: Truck, label: "Free Shipping", sub: "On orders over $50" },
  { icon: RotateCcw, label: "Easy Returns", sub: "30-day return policy" },
  { icon: Shield, label: "Secure Payments", sub: "256-bit SSL encrypted" },
  { icon: CreditCard, label: "Flexible Payment", sub: "All major cards accepted" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-white dark:border-dark-border dark:bg-dark-surface">

      {/* ── Trust badges strip ─────────────────────────────────────────────── */}
      <div className="border-b border-border dark:border-dark-border">
        <div className="mx-auto grid max-w-screen-xl grid-cols-2 divide-x divide-border dark:divide-dark-border lg:grid-cols-4">
          {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/10">
                <Icon size={18} className="text-primary" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">{label}</p>
                <p className="text-xs text-ink-muted">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main footer ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl px-6 pb-10 pt-12">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="group flex items-center gap-2" aria-label="MERNShop home">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-all duration-200 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/25">
                <ShoppingBag size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-serif text-base tracking-tight text-ink dark:text-white">
                MERN<span className="text-primary">Shop</span>
              </span>
            </Link>

            <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-ink-muted">
              Thousands of carefully selected products across electronics, fashion, books, and lifestyle.
            </p>

            {/* Contact info */}
            <ul className="mt-5 space-y-2">
              {[
                { icon: Mail, text: "fahadj698@gmail.com" href: "mailto:fahadj698@gmail.com" },
                { icon: Phone, text: "+92 309-9639354" href: "tel:+923099639354" },
                { icon: MapPin, text: "Lahore, Pakistan" href: "https://google.com" },
              ].map(({ icon: Icon, text, href }) => (
                <li key={text} className="flex items-center gap-2 text-xs text-ink-muted">
                  <Icon size={12} className="flex-shrink-0 text-primary" strokeWidth={2} />
                  {text}
                </li>
              ))}
            </ul>

            {/* Social */}
            <div className="mt-5 flex items-center gap-2">
              {[
                { href: "https://github.com/fahadali0077", Icon: Github, label: "GitHub" },
                { href: "https://www.linkedin.com/in/fahad-ali-840a093a8/", Icon: Linkedin, label: "LinkedIn" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-muted transition-all hover:border-primary hover:bg-primary/10 hover:text-primary dark:border-dark-border dark:hover:border-primary dark:hover:text-primary"
                >
                  <Icon size={14} strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-ink dark:text-white">
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-ink-muted transition-colors hover:text-primary dark:text-white/50 dark:hover:text-primary"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────────── */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 dark:border-dark-border sm:flex-row">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} MERNShop. All rights reserved.
          </p>

          {/* Payment icons */}
          <div className="flex items-center gap-2">
            {["VISA", "MC", "AMEX", "PayPal"].map((brand) => (
              <span
                key={brand}
                className="rounded border border-border bg-surface-raised px-2 py-0.5 text-[10px] font-bold text-ink-muted dark:border-dark-border dark:bg-dark-surface-2"
              >
                {brand}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((label) => (
              <Link
                key={label}
                href="#"
                className="text-xs text-ink-muted transition-colors hover:text-ink dark:hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const LINKS = {
  Shop:    [{ href: "/products", label: "All Products" }, { href: "/cart", label: "My Cart" }, { href: "/account", label: "Account" }],
  Company: [{ href: "/", label: "About" }, { href: "/sitemap.xml", label: "Sitemap" }, { href: "/robots.txt", label: "robots.txt" }],
  Admin:   [{ href: "/admin/login", label: "Admin Login" }, { href: "/admin", label: "Dashboard" }],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-white dark:border-dark-border dark:bg-dark-surface">
      <div className="mx-auto max-w-screen-xl px-6 pb-12 pt-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2" aria-label="MERNShop home">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink dark:bg-amber">
                <ShoppingBag size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-serif text-base tracking-tight text-ink dark:text-white">
                MERN<span className="text-amber">Shop</span>
              </span>
            </Link>
            <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-ink-muted">
              A production-grade storefront built with Next.js 15 and TypeScript.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {group}
              </p>
              <ul className="space-y-2">
                {items.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-ink-soft transition-colors duration-150 hover:text-amber dark:text-white/60 dark:hover:text-amber"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-6 dark:border-dark-border/40">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} MERNShop. Built with Next.js 15 · TypeScript · Tailwind CSS.
          </p>
          <p className="text-xs text-ink-muted">
            © 2026 MERNShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

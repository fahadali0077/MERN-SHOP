import Link from "next/link";
import {
  ShoppingBag, Github,
  Linkedin
} from "lucide-react";

const LINKS = {
  Shop: [
    { href: "/products", label: "All Products" },
    { href: "/cart", label: "My Cart" },
    { href: "/account", label: "Account" },
    { href: "/wishlist", label: "Wishlist" },
  ],
  Company: [
    { href: "/", label: "About" },
    { href: "/sitemap.xml", label: "Sitemap" },
  ],
  Admin: [
    { href: "/admin/login", label: "Admin Login" },
    { href: "/admin", label: "Dashboard" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-raised dark:border-dark-border dark:bg-dark-surface">
      <div className="mx-auto max-w-screen-xl px-6 pb-12 pt-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="group flex items-center gap-2" aria-label="MERNShop home">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/25">
                <ShoppingBag size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-serif text-base tracking-tight text-ink dark:text-white">
                MERN<span className="text-primary">Shop</span>
              </span>
            </Link>

            <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-ink-muted">
              A production-grade storefront built with Next.js 15, TypeScript, and Tailwind CSS.
            </p>

            {/* Social links */}
            <div className="mt-5 flex items-center gap-2">
              {[
                { href: "https://github.com/fahadali0077", Icon: Github, label: "GitHub" },
                { href: "https://www.linkedin.com/in/fahad-ali-840a093a8/", Icon: Linkedin, label: "LinkedIn" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-muted transition-all hover:border-primary hover:bg-primary-light hover:text-primary dark:border-dark-border dark:hover:border-primary dark:hover:bg-primary/10 dark:hover:text-primary"
                >
                  <Icon size={14} strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex items-center gap-1.5 text-sm text-ink-soft transition-all hover:text-primary dark:text-white/60 dark:hover:text-primary"
                    >
                      <span className="h-px w-0 bg-primary transition-all duration-200 group-hover:w-3" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-6 dark:border-dark-border/50">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} MERNShop. Built with Next.js 15 · TypeScript · Tailwind CSS.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-ink-muted transition-colors hover:text-ink dark:hover:text-white">Privacy</Link>
            <Link href="#" className="text-xs text-ink-muted transition-colors hover:text-ink dark:hover:text-white">Terms</Link>
            <Link href="#" className="text-xs text-ink-muted transition-colors hover:text-ink dark:hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

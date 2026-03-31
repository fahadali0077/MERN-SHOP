"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",         label: "Home",  exact: true  },
  { href: "/products", label: "Shop",  exact: false },
  { href: "/cart",     label: "Cart",  exact: false },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-0.5" aria-label="Main navigation">
      {NAV.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "nav-link rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "active text-ink dark:text-white"
                : "text-ink-muted hover:text-ink dark:text-white/70 dark:hover:text-white",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const BASE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/cart", label: "Cart" },
];

const AUTH_LINKS = [
  { href: "/account", label: "Account" },
  { href: "/account/orders", label: "My Orders" },
];

const GUEST_LINKS = [
  { href: "/auth/login", label: "Sign In" },
  { href: "/auth/register", label: "Register" },
];

interface MobileMenuProps {
  isLoggedIn: boolean;
}

export function MobileMenu({ isLoggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [...BASE_LINKS, ...(isLoggedIn ? AUTH_LINKS : GUEST_LINKS)];

  return (
    <div className="md:hidden">
      <button
        onClick={() => { setOpen((v) => !v); }}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-ink-soft dark:border-dark-border dark:bg-dark-surface dark:text-white"
      >
        {open ? <X size={16} strokeWidth={2} /> : <Menu size={16} strokeWidth={2} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
              onClick={() => { setOpen(false); }}
            />
            <motion.nav
              key="panel"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-4 right-4 top-[68px] z-50 overflow-hidden rounded-2xl border border-border bg-white shadow-lg dark:border-dark-border dark:bg-dark-surface"
              aria-label="Mobile navigation"
            >
              <div className="p-2">
                {links.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => { setOpen(false); }}
                      className={cn(
                        "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-amber-dim text-amber font-semibold dark:bg-amber/10"
                          : "text-ink-soft hover:bg-cream hover:text-ink dark:text-white/70 dark:hover:bg-dark-surface-2 dark:hover:text-white",
                      )}
                    >
                      {label}
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber" />}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
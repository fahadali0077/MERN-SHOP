"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import type { CartItem } from "@/types";

/**
 * FIX #1 / #8 / D28: a single client-side hydrator, mounted once in the root
 * layout. On load it:
 *   1. Reads the current user from /api/auth/me (which reads the HttpOnly
 *      session/accessToken cookie server-side and silently refreshes if needed).
 *      This replaces the old localStorage-persisted token + isAuthenticated.
 *   2. Seeds the in-memory cart mirror from /api/cart (the server cookie cart),
 *      so the navbar badge and drawer match the /cart and /checkout pages.
 *
 * It renders nothing.
 */
export function AuthHydrator() {
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const setItems = useCartStore((s) => s.setItems);
  const setCartHydrated = useCartStore((s) => s.setHydrated);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1) Hydrate auth from the cookie session.
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!cancelled) {
          if (res.ok) {
            const json = (await res.json()) as { success: boolean; data?: never };
            if (json.success && json.data) setUser(json.data);
            else logout();
          } else {
            logout();
          }
        }
      } catch {
        if (!cancelled) logout();
      }

      // 2) Seed the cart mirror from the server cookie cart.
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!cancelled && res.ok) {
          const json = (await res.json()) as { success: boolean; data?: CartItem[] };
          if (json.success && Array.isArray(json.data)) setItems(json.data);
        }
      } catch {
        /* non-fatal: badge just starts at 0 until first action */
      } finally {
        if (!cancelled) setCartHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUser, logout, setItems, setCartHydrated]);

  return null;
}

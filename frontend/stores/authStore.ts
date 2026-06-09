"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  /**
   * FIX #8: accessToken lives ONLY in memory (never persisted to localStorage).
   * The durable token is the HttpOnly `accessToken` cookie, used server-side.
   * This in-memory copy is a convenience for the current tab only and is allowed
   * to be null — client code must not depend on it for authenticated calls
   * (those go through server actions / route handlers that read the cookie).
   */
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuth: (user: User, accessToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,

        // Used by the one-time hydrator (reads /api/auth/me from the cookie session).
        setUser: (user) =>
          set({ user, isAuthenticated: Boolean(user) }, false, "auth/setUser"),

        setAuth: (user, accessToken) =>
          set(
            { user, accessToken: accessToken ?? null, isAuthenticated: true },
            false,
            "auth/setAuth"
          ),

        logout: () =>
          set(
            { user: null, accessToken: null, isAuthenticated: false },
            false,
            "auth/logout"
          ),
      }),
      {
        name: "mernshop-auth",
        // FIX #8: persist ONLY the non-sensitive user profile. Never persist the
        // JWT or the isAuthenticated flag (which would let a stale flag claim a
        // logged-in state with no valid cookie).
        partialize: (s) => ({ user: s.user }),
      }
    ),
    { name: "AuthStore" }
  )
);

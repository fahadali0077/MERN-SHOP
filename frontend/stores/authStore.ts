"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,

        // Called after successful login/register — stores real user + token
        setAuth: (user: User, accessToken: string) => {
          set({ user, accessToken, isAuthenticated: true }, false, "auth/setAuth");
        },

        logout: () => {
          set({ user: null, accessToken: null, isAuthenticated: false }, false, "auth/logout");
          // Clear server cookies
          fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
        },
      }),
      {
        name: "mernshop-auth",
        partialize: (s) => ({ user: s.user, accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }),
      }
    ),
    { name: "AuthStore" }
  )
);
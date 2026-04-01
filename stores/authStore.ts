"use client";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, _password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        login: async (email: string, _password: string) => {
          // Small delay for UX feedback
          await new Promise((r) => setTimeout(r, 500));
          set(
            {
              isAuthenticated: true,
              user: {
                id: `user-${Date.now()}`,
                name: email.split("@")[0] ?? "User",
                email,
                role: "customer",
                createdAt: new Date().toISOString(),
              },
            },
            false,
            "auth/login",
          );
        },
        logout: () => {
          // Clear Zustand state
          set({ user: null, isAuthenticated: false }, false, "auth/logout");
          // Clear server-side cookies via API call (fire-and-forget)
          fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
        },
      }),
      {
        name: "mernshop-auth",
        partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
      },
    ),
    { name: "AuthStore" },
  ),
);

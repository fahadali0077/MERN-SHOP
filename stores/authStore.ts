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
          await new Promise((r) => setTimeout(r, 700));
          set(
            {
              isAuthenticated: true,
              user: {
                id: `user-${Date.now()}`,
                name: email.split("@")[0] ?? "User",
                email,
                role: "customer",          // always customer — admin has its own gate
                createdAt: new Date().toISOString(),
              },
            },
            false,
            "auth/login",
          );
        },
        logout: () => set({ user: null, isAuthenticated: false }, false, "auth/logout"),
      }),
      { name: "mernshop-auth", partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) },
    ),
    { name: "AuthStore" },
  ),
);

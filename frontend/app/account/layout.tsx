"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/auth/login?from=/account");
    }
  }, [hydrated, isAuthenticated, router]);

  // Show nothing until we know auth state (avoids flash of content)
  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-surface-sunken py-2 dark:bg-dark-bg" />
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-sunken py-2 dark:bg-dark-bg">
      {children}
    </div>
  );
}
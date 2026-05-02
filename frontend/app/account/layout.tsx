import type { ReactNode } from "react";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-sunken py-2 dark:bg-dark-bg">
      {children}
    </div>
  );
}
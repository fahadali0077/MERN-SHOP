"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-lg border border-border bg-white dark:border-dark-border dark:bg-dark-surface" />;
  }

  const cycle = () => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  };

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label = theme === "dark" ? "Switch to system" : theme === "light" ? "Switch to dark" : "Switch to light";

  return (
    <button
      onClick={cycle}
      title={label}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-ink-muted shadow-xs transition-all hover:border-amber hover:text-amber dark:border-dark-border dark:bg-dark-surface dark:text-white/70 dark:hover:border-amber dark:hover:text-amber"
    >
      <Icon size={15} strokeWidth={2} />
    </button>
  );
}

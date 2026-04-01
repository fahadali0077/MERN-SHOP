"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * ThemeProvider — wraps the app in next-themes.
 *
 * MENTAL MODEL — next-themes dark mode:
 *   next-themes reads the user's system preference on first load and
 *   stores their explicit choice in localStorage. It adds a `dark` class
 *   to <html> which activates Tailwind's `dark:` variant.
 *
 *   attribute="class" → adds/removes the "dark" className on <html>
 *   defaultTheme="system" → respects OS setting on first visit
 *   enableSystem → allows system preference detection
 *   disableTransitionOnChange → prevents flash on theme switch
 *
 * We wrap this in a Client Component because useTheme() (used by
 * ThemeToggle) is a hook — it reads/writes localStorage.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

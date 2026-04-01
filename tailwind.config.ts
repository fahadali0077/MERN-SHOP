import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["DM Sans", "var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["DM Serif Display", "var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        // Core neutrals — crisp white-based like Google
        ink:       { DEFAULT: "#111827", soft: "#374151", muted: "#9ca3af" },
        surface:   { DEFAULT: "#ffffff", raised: "#f9fafb", sunken: "#f3f4f6" },
        parchment: "#ffffff",   // kept for compat — now maps to pure white
        cream:     "#f9fafb",
        // Primary accent — Google Blue
        primary: {
          DEFAULT: "#3b82f6",
          light:   "#eff6ff",
          dim:     "#dbeafe",
          dark:    "#1d4ed8",
          600:     "#2563eb",
        },
        // Secondary accent — Cyan
        cyan: {
          DEFAULT: "#06b6d4",
          light:   "#ecfeff",
          dim:     "#cffafe",
        },
        // Keep amber for legacy/warm accents
        amber: {
          DEFAULT: "#d97706",
          light:   "#fbbf24",
          dim:     "#fef3c7",
          600:     "#b45309",
        },
        border:          "#e5e7eb",
        "dark-bg":       "#030712",
        "dark-surface":  "#111827",
        "dark-surface-2":"#1f2937",
        "dark-border":   "#374151",
      },
      borderRadius: {
        DEFAULT: "8px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
      },
      boxShadow: {
        xs:  "0 1px 2px rgba(0,0,0,0.05)",
        sm:  "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
        md:  "0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
        lg:  "0 10px 40px rgba(0,0,0,0.10), 0 4px 14px rgba(0,0,0,0.05)",
        xl:  "0 24px 64px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.06)",
        hover: "0 20px 60px rgba(0,0,0,0.13), 0 8px 24px rgba(0,0,0,0.07)",
        "inner-sm": "inset 0 1px 0 rgba(255,255,255,0.06)",
        "blue-glow": "0 0 0 3px rgba(59,130,246,0.15), 0 4px 12px rgba(0,0,0,0.06)",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "expo-out": "cubic-bezier(0.19, 1, 0.22, 1)",
        "quint-in-out": "cubic-bezier(0.83, 0, 0.17, 1)",
      },
      keyframes: {
        // Tailwind-accessible keyframes for JIT usage
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in":  "fade-in 0.4s ease both",
        "slide-up": "slide-up 0.5s cubic-bezier(0.19, 1, 0.22, 1) both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
      },
    },
  },
  plugins: [],
};
export default config;

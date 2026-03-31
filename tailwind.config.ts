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
        sans:  ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        ink: { DEFAULT: "#1a1612", soft: "#3d3830", muted: "#8a7f74" },
        parchment: "#f7f3ee",
        cream: "#ede8e0",
        amber: {
          DEFAULT: "#d97706",
          light:   "#fbbf24",
          dim:     "#fef3c7",
          600:     "#b45309",
        },
        border: "#e2dbd2",
        "dark-bg":       "#0c0b09",
        "dark-surface":  "#161310",
        "dark-surface-2":"#1f1c18",
        "dark-border":   "#2a2520",
      },
      borderRadius: {
        DEFAULT: "8px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
      },
      boxShadow: {
        xs:  "0 1px 2px rgba(26,22,18,0.06)",
        sm:  "0 2px 6px rgba(26,22,18,0.08)",
        md:  "0 4px 16px rgba(26,22,18,0.10)",
        lg:  "0 8px 30px rgba(26,22,18,0.12)",
        xl:  "0 20px 60px rgba(26,22,18,0.16)",
        "inner-sm": "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-back": "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
      },
      spacing: {
        "3xs": "0.5rem",
      },
    },
  },
  plugins: [],
};
export default config;

import { Inter, Playfair_Display } from "next/font/google";

/**
 * next/font — Module 7
 *
 * MENTAL MODEL:
 *   next/font downloads font files at BUILD TIME and serves them from your
 *   own domain. This means:
 *     ✅ Zero layout shift (font is loaded before render)
 *     ✅ No external network request to Google Fonts at runtime
 *     ✅ Privacy-respecting (no third-party tracking)
 *     ✅ Automatic font-display: swap
 *
 *   Before next/font (Module 4–6): <link href="fonts.googleapis.com/...">
 *   in globals.css caused a render-blocking request.
 *   Now: fonts are part of the build, inlined via CSS variables.
 *
 * CURRICULUM SPEC:
 *   "Inter for body, Playfair Display for headings"
 *
 * USAGE:
 *   The exported CSS variable names are applied in layout.tsx via className,
 *   then referenced in tailwind.config.ts as fontFamily values.
 *
 *   font-sans → Inter        (body text, UI)
 *   font-serif → Playfair Display  (headings, product names)
 *
 * subsets: ["latin"] — only download the latin character subset (~70% smaller)
 * display: "swap" — show fallback font until custom font loads
 * variable: "--font-..." — exposes as a CSS custom property
 */

export const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const fontSerif = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

import type { Metadata } from "next";
import "./globals.css";
import { fontSans, fontSerif } from "@/lib/fonts";
import { DEFAULT_METADATA } from "@/lib/metadata";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCartDrawer } from "@/components/layout/AnimatedCartDrawer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  ...DEFAULT_METADATA,
  title: { default: "MERNShop", template: "%s — MERNShop" },
  description: "Discover premium products across electronics, fashion, books, and lifestyle.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontSerif.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-parchment antialiased dark:bg-dark-bg">
        <ThemeProvider>
          <AnimatedCartDrawer />
          <Navbar />
          <main className="mx-auto w-full max-w-screen-xl flex-1 px-5 pt-2 pb-12 sm:px-8 md:px-10 md:pt-4 md:pb-16">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

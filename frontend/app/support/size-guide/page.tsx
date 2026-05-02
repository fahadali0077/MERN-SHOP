import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Ruler } from "lucide-react";

export const metadata: Metadata = { title: "Size Guide" };

const TOPS = [
  { size: "XS", chest: "32–34\"", waist: "26–28\"", hip: "34–36\"" },
  { size: "S",  chest: "34–36\"", waist: "28–30\"", hip: "36–38\"" },
  { size: "M",  chest: "38–40\"", waist: "32–34\"", hip: "40–42\"" },
  { size: "L",  chest: "42–44\"", waist: "36–38\"", hip: "44–46\"" },
  { size: "XL", chest: "46–48\"", waist: "40–42\"", hip: "48–50\"" },
  { size: "2XL",chest: "50–52\"", waist: "44–46\"", hip: "52–54\"" },
];

const SHOES = [
  { eu: "36", uk: "3.5", us: "5.5", cm: "22.5" },
  { eu: "37", uk: "4",   us: "6",   cm: "23" },
  { eu: "38", uk: "5",   us: "7",   cm: "24" },
  { eu: "39", uk: "5.5", us: "7.5", cm: "24.5" },
  { eu: "40", uk: "6.5", us: "8.5", cm: "25.5" },
  { eu: "41", uk: "7",   us: "9",   cm: "26" },
  { eu: "42", uk: "8",   us: "10",  cm: "27" },
  { eu: "43", uk: "9",   us: "11",  cm: "28" },
  { eu: "44", uk: "10",  us: "12",  cm: "28.5" },
];

const TIPS = [
  "Use a flexible tape measure for best accuracy.",
  "Measure over light clothing or underwear.",
  "Keep the tape snug but not tight.",
  "For chest, measure at the fullest part.",
  "For waist, measure at the narrowest point.",
  "When between sizes, size up for comfort.",
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
        <ArrowLeft size={15} /> Back to Home
      </Link>

      <div className="mb-8">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Ruler size={26} className="text-primary" />
        </div>
        <h1 className="font-serif text-3xl text-ink dark:text-white">Size Guide</h1>
        <p className="mt-2 text-ink-muted">Find your perfect fit with our measurement charts.</p>
      </div>

      {/* Clothing sizes */}
      <h2 className="mb-4 font-semibold text-ink dark:text-white">Clothing — Tops &amp; Outerwear</h2>
      <div className="mb-10 overflow-hidden rounded-xl border border-border dark:border-dark-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised dark:bg-dark-surface-2">
            <tr>
              {["Size", "Chest", "Waist", "Hip"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white dark:divide-dark-border dark:bg-dark-surface">
            {TOPS.map(({ size, chest, waist, hip }) => (
              <tr key={size} className="hover:bg-amber-50 dark:hover:bg-amber/5">
                <td className="px-4 py-3 font-bold text-primary">{size}</td>
                <td className="px-4 py-3 text-ink-muted">{chest}</td>
                <td className="px-4 py-3 text-ink-muted">{waist}</td>
                <td className="px-4 py-3 text-ink-muted">{hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footwear */}
      <h2 className="mb-4 font-semibold text-ink dark:text-white">Footwear</h2>
      <div className="mb-10 overflow-hidden rounded-xl border border-border dark:border-dark-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised dark:bg-dark-surface-2">
            <tr>
              {["EU", "UK", "US", "Length (cm)"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white dark:divide-dark-border dark:bg-dark-surface">
            {SHOES.map(({ eu, uk, us, cm }) => (
              <tr key={eu} className="hover:bg-amber-50 dark:hover:bg-amber/5">
                <td className="px-4 py-3 font-bold text-primary">{eu}</td>
                <td className="px-4 py-3 text-ink-muted">{uk}</td>
                <td className="px-4 py-3 text-ink-muted">{us}</td>
                <td className="px-4 py-3 text-ink-muted">{cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tips */}
      <h2 className="mb-4 font-semibold text-ink dark:text-white">Measuring Tips</h2>
      <div className="rounded-xl border border-border bg-white p-5 dark:border-dark-border dark:bg-dark-surface">
        <ul className="grid gap-2 sm:grid-cols-2">
          {TIPS.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-ink-muted">
              <span className="mt-0.5 text-primary">•</span> {t}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Still unsure?{" "}
        <Link href="/support/contact" className="font-semibold text-primary hover:underline">Ask our team →</Link>
      </p>
    </div>
  );
}

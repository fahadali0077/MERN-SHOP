import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-[120px] font-normal leading-none text-border dark:text-dark-border">
        404
      </p>
      <h1 className="mt-2 font-serif text-2xl font-normal text-ink dark:text-white">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-sm text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft dark:bg-amber dark:hover:bg-amber-600"
        >
          <ArrowLeft size={14} /> Go home
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink-soft hover:border-ink hover:text-ink dark:border-dark-border dark:bg-dark-surface dark:text-white"
        >
          Browse products
        </Link>
      </div>
    </div>
  );
}

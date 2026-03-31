"use client";



import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home & Kitchen", "Books", "Sports"] as const;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating-desc", label: "Top Rated" },
  { value: "reviews-desc", label: "Most Reviewed" },
] as const;

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState(sp.get("q") ?? "");
  const activeCategory = sp.get("category") ?? "All";
  const activeSort = sp.get("sort") ?? "featured";

  const buildUrl = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(sp.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (!v || v === "All" || v === "featured") params.delete(k);
        else params.set(k, v);
      });
      const qs = params.toString();
      return `${pathname}${qs ? `?${qs}` : ""}`;
    },
    [pathname, sp],
  );

  const push = useCallback(
    (updates: Record<string, string>) => { router.push(buildUrl(updates)); },
    [router, buildUrl],
  );

  // Debounce text input
  const handleQuery = (val: string) => {
    setQuery(val);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { push({ q: val }); }, 300);
  };

  // Sync query if URL changes externally
  useEffect(() => { setQuery(sp.get("q") ?? ""); }, [sp]);

  return (
    <div className="mb-8 flex flex-col gap-3">
      {/* Row 1: search input */}
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => { handleQuery(e.target.value); }}
          placeholder="Search products…"
          aria-label="Search products"
          className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-10 text-sm text-ink placeholder-ink-muted outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/10 dark:border-dark-border dark:bg-dark-surface dark:text-white"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); push({ q: "" }); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink dark:hover:text-white"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Row 2: category pills + sort */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={13} className="flex-shrink-0 text-ink-muted" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { push({ category: cat }); }}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-medium transition-all",
              activeCategory === cat
                ? "border-amber bg-amber text-white"
                : "border-border bg-white text-ink-muted hover:border-amber hover:text-amber dark:border-dark-border dark:bg-dark-surface dark:text-white/60 dark:hover:border-amber dark:hover:text-amber",
            )}
          >
            {cat}
          </button>
        ))}

        <div className="ml-auto">
          <select
            value={activeSort}
            onChange={(e) => { push({ sort: e.target.value }); }}
            aria-label="Sort products"
            className="h-9 rounded-xl border border-border bg-white px-3 text-xs text-ink outline-none transition focus:border-amber dark:border-dark-border dark:bg-dark-surface dark:text-white"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

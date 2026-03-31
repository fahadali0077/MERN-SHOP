"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home & Kitchen", "Books", "Sports"] as const;

const SORT_OPTIONS = [
  { value: "featured",     label: "Featured"          },
  { value: "price-asc",    label: "Price: Low → High" },
  { value: "price-desc",   label: "Price: High → Low" },
  { value: "rating-desc",  label: "Top Rated"         },
  { value: "reviews-desc", label: "Most Reviewed"     },
] as const;

export function SearchBar() {
  const router   = useRouter();
  const pathname = usePathname();
  const sp       = useSearchParams();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query,   setQuery]   = useState(sp.get("q") ?? "");
  const [focused, setFocused] = useState(false);
  const activeCategory = sp.get("category") ?? "All";
  const activeSort     = sp.get("sort")     ?? "featured";

  const buildUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(sp.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === "All" || v === "featured") params.delete(k);
      else params.set(k, v);
    });
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  };

  const push = (updates: Record<string, string>) => router.push(buildUrl(updates));

  const handleQuery = (val: string) => {
    setQuery(val);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => push({ q: val }), 300);
  };

  useEffect(() => setQuery(sp.get("q") ?? ""), [sp]);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-3">
      {/* Search input */}
      <div className="relative">
        <Search
          size={15}
          className={cn(
            "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200",
            focused ? "text-primary" : "text-ink-muted",
          )}
        />

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search products…"
          aria-label="Search products"
          className={cn(
            "search-enhanced h-11 w-full rounded-xl border bg-white pl-10 pr-24 text-sm text-ink placeholder-ink-muted outline-none",
            "dark:bg-dark-surface dark:text-white dark:placeholder-ink-muted",
            focused
              ? "border-primary"
              : "border-border dark:border-dark-border",
          )}
        />

        {/* Keyboard shortcut hint */}
        {!query && !focused && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="rounded border border-border bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium text-ink-muted dark:border-dark-border dark:bg-dark-surface-2">
              ⌘K
            </kbd>
          </div>
        )}

        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(""); push({ q: "" }); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-ink-muted/20 text-ink-muted transition-all hover:bg-ink-muted/30 hover:text-ink dark:hover:text-white"
            aria-label="Clear search"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Category pills + sort */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={13} className="flex-shrink-0 text-ink-muted" />

        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            onClick={() => push({ category: cat })}
            style={{ animationDelay: `${i * 0.04}s` }}
            className={cn(
              "cat-pill rounded-full border px-3.5 py-1 text-xs font-medium transition-all duration-200",
              activeCategory === cat
                ? "border-primary bg-primary text-white shadow-sm"
                : [
                    "border-border bg-white text-ink-muted",
                    "hover:border-primary hover:bg-primary-light hover:text-primary",
                    "dark:border-dark-border dark:bg-dark-surface dark:text-white/60",
                    "dark:hover:border-primary dark:hover:text-primary",
                  ].join(" "),
            )}
          >
            {cat}
          </button>
        ))}

        <div className="ml-auto">
          <select
            value={activeSort}
            onChange={(e) => push({ sort: e.target.value })}
            aria-label="Sort products"
            className="h-9 cursor-pointer rounded-xl border border-border bg-white px-3 text-xs text-ink outline-none transition-all hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-dark-border dark:bg-dark-surface dark:text-white"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filter summary */}
      {(query || activeCategory !== "All") && (
        <div className="flex flex-wrap items-center gap-2 animate-slide-up">
          <span className="text-xs text-ink-muted">Filtering:</span>
          {query && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-dim px-2.5 py-1 text-xs font-medium text-primary">
              {`"${query}"`}
              <button onClick={() => { setQuery(""); push({ q: "" }); }} className="ml-0.5 hover:opacity-70">
                <X size={10} strokeWidth={2.5} />
              </button>
            </span>
          )}
          {activeCategory !== "All" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-dim px-2.5 py-1 text-xs font-medium text-primary">
              {activeCategory}
              <button onClick={() => push({ category: "All" })} className="ml-0.5 hover:opacity-70">
                <X size={10} strokeWidth={2.5} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

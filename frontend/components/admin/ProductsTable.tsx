"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

// Use the real Product type from the API (includes stock)
interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  badge?: string | null;
  image: string;
}

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";
const CATEGORIES = ["All", "Electronics", "Fashion", "Home & Kitchen", "Books", "Sports"];

const columnHelper = createColumnHelper<AdminProduct>();

const columns = [
  columnHelper.accessor("name", {
    header: "Product",
    cell: (info) => (
      <div className="flex items-center gap-3">
        <img
          src={info.row.original.image}
          alt={info.getValue()}
          className="h-8 w-8 rounded-lg object-cover bg-cream flex-shrink-0"
        />
        <span className="font-medium text-ink dark:text-white truncate max-w-[200px]">
          {info.getValue()}
        </span>
      </div>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor("category", {
    header: "Category",
    cell: (info) => (
      <span className="rounded-full bg-amber-dim px-2 py-0.5 text-xs font-semibold text-amber dark:bg-amber/10">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("price", {
    header: "Price",
    cell: (info) => <span className="tabular-nums dark:text-white">${info.getValue().toFixed(2)}</span>,
    enableSorting: true,
  }),
  columnHelper.accessor("stock", {
    header: "Stock",
    cell: (info) => {
      const v = info.getValue();
      const inStock = v > 0;
      return (
        <div className="flex items-center gap-2">
          <span className={cn("font-semibold tabular-nums", v <= 5 ? "text-red-600 dark:text-red-400" : v <= 20 ? "text-amber" : "text-green-600 dark:text-green-400")}>
            {v <= 5 ? `⚠ ${v}` : v}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              inStock
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
            )}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      );
    },
    enableSorting: true,
  }),
  columnHelper.accessor("rating", {
    header: "Rating",
    cell: (info) => <span className="tabular-nums dark:text-white">★ {info.getValue().toFixed(1)}</span>,
    enableSorting: true,
  }),
  columnHelper.accessor("badge", {
    header: "Badge",
    cell: (info) => info.getValue()
      ? <span className="rounded-full bg-amber px-2 py-0.5 text-xs font-bold text-white">{info.getValue()}</span>
      : <span className="text-ink-muted">—</span>,
    enableSorting: false,
  }),
];

export function ProductsTable() {
  const currentRole = useAuthStore((s) => s.user?.role ?? "customer");
  const isAdmin = currentRole === "admin";
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/products?limit=50`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const json = await res.json() as { success: boolean; data: AdminProduct[] };
      if (!json.success) throw new Error("API returned success: false");
      setProducts(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchProducts(); }, []);

  const filteredData = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white dark:border-dark-border dark:bg-dark-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4 dark:border-dark-border">
        <h2 className="font-serif text-lg font-normal dark:text-white">Products</h2>
        {!isAdmin && (
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:border-purple-500/20 dark:bg-purple-900/10 dark:text-purple-400">
            View & Edit only — cannot create or delete
          </span>
        )}
        <button
          onClick={() => { void fetchProducts(); }}
          disabled={loading}
          className="ml-1 flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-ink-muted hover:border-amber hover:text-amber disabled:opacity-40 dark:border-dark-border dark:text-white"
          title="Refresh from API"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
        <div className="ml-auto flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); table.setPageIndex(0); }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                selectedCategory === cat
                  ? "bg-ink text-white dark:bg-amber"
                  : "border border-border bg-cream text-ink-soft hover:border-amber hover:text-amber dark:border-dark-border dark:bg-dark-surface-2 dark:text-white",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error states */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-ink-muted">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading products from API…</span>
        </div>
      )}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => { void fetchProducts(); }}
            className="text-xs font-semibold text-amber underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-t border-gray-200 text-sm dark:border-dark-border">
              <thead className="sticky top-0 z-10 bg-white dark:bg-dark-surface">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-border dark:border-dark-border">
                    {hg.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 text-left">
                        {header.isPlaceholder ? null : (
                          <button
                            className={cn(
                              "flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500",
                              header.column.getCanSort() && "cursor-pointer hover:text-ink dark:hover:text-white",
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              header.column.getIsSorted() === "asc" ? <ChevronUp size={13} /> :
                                header.column.getIsSorted() === "desc" ? <ChevronDown size={13} /> :
                                  <ChevronsUpDown size={13} className="opacity-40" />
                            )}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-border/50 transition-colors duration-150 hover:bg-amber-50 dark:border-dark-border dark:hover:bg-amber/5",
                      idx % 2 === 1 && "bg-gray-50 dark:bg-dark-surface-2/40",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-ink-muted">
                      No products found for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border p-4 dark:border-dark-border">
            <p className="text-xs text-ink-muted">
              {table.getFilteredRowModel().rows.length} products ·{" "}
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { table.previousPage(); }}
                disabled={!table.getCanPreviousPage()}
                className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted hover:border-amber hover:text-amber disabled:opacity-30 dark:border-dark-border dark:text-white"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => { table.nextPage(); }}
                disabled={!table.getCanNextPage()}
                className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted hover:border-amber hover:text-amber disabled:opacity-30 dark:border-dark-border dark:text-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

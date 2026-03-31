"use client";

import { useState, useMemo } from "react";
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
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { ADMIN_PRODUCTS, type AdminProduct } from "@/lib/mock/adminData";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home & Kitchen", "Books", "Sports"];
const columnHelper = createColumnHelper<AdminProduct>();

const columns = [
  columnHelper.accessor("name", {
    header: "Product",
    cell: (info) => (
      <span className="font-medium text-ink dark:text-white">{info.getValue()}</span>
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredData = useMemo(() => {
    if (selectedCategory === "All") return ADMIN_PRODUCTS;
    return ADMIN_PRODUCTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

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
    initialState: { pagination: { pageSize: 6 } },
  });

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white dark:border-dark-border dark:bg-dark-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4 dark:border-dark-border">
        <h2 className="font-serif text-lg font-normal dark:text-white">Products</h2>
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

      {/* Table */}
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
    </div>
  );
}

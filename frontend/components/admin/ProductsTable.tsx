"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel, createColumnHelper,
  flexRender, type SortingState, type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  Loader2, RefreshCw, Plus, Pencil, Trash2, X, Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/stores/toastStore";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";
const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports"];

interface AdminProduct {
  id: string;
  _id?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  badge?: string | null;
  image: string;
  description?: string;
  originalPrice?: number | null;
}

const EMPTY_PRODUCT: Omit<AdminProduct, "id" | "_id" | "rating"> = {
  name: "", category: "Electronics", price: 0,
  stock: 0, badge: null, image: "", description: "", originalPrice: null,
};

// ── Edit / Create Modal ───────────────────────────────────────────────────────
function ProductModal({
  product,
  onClose,
  onSaved,
  token,
}: {
  product: AdminProduct | null; // null = create new
  onClose: () => void;
  onSaved: (p: AdminProduct) => void;
  token: string | null;
}) {
  const isNew = product === null;
  const [form, setForm] = useState<typeof EMPTY_PRODUCT>(
    isNew ? { ...EMPTY_PRODUCT } : {
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      badge: product.badge ?? null,
      image: product.image,
      description: product.description ?? "",
      originalPrice: product.originalPrice ?? null,
    }
  );
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (form.price <= 0) { toast.error("Price must be greater than 0"); return; }
    setSaving(true);
    try {
      const url = isNew
        ? `${API_URL}/api/v1/products`
        : `${API_URL}/api/v1/products/${product!._id ?? product!.id}`;
      const method = isNew ? "POST" : "PUT";
      // Build body cleanly — omit null/empty optional fields entirely.
      // The backend uses Zod .optional() which accepts undefined but NOT null,
      // so sending null for badge or originalPrice causes a 422.
      const body: Record<string, unknown> = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.image,
        description: form.description ?? "",
      };
      if (form.badge) body["badge"] = form.badge;
      if (form.originalPrice != null && !isNaN(form.originalPrice) && form.originalPrice > 0) {
        body["originalPrice"] = form.originalPrice;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const json = await res.json() as { success: boolean; data: AdminProduct; error?: string };
      if (!json.success) throw new Error(json.error ?? "Save failed");
      toast.success(isNew ? "Product created!" : "Product updated!", form.name);
      onSaved(json.data);
      onClose();
    } catch (err) {
      toast.error("Failed to save", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1 block text-xs font-semibold text-ink-muted uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-surface dark:text-white";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-white shadow-2xl dark:border-dark-border dark:bg-dark-surface">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 dark:border-dark-border">
          <h2 className="font-semibold text-ink dark:text-white">{isNew ? "Add New Product" : "Edit Product"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-muted hover:bg-border/60 hover:text-ink dark:hover:bg-dark-border">
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid gap-4">
            <Field label="Product Name">
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. iPhone 15 Pro" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Badge">
                <select className={inputCls} value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value || null)}>
                  <option value="">None</option>
                  {["New", "Hot", "Sale"].map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Price ($)">
                <input type="number" min="0" step="0.01" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value === "" ? 0 : parseFloat(e.target.value))} />
              </Field>
              <Field label="Original Price ($)">
                <input type="number" min="0" step="0.01" className={inputCls} value={form.originalPrice ?? ""} onChange={(e) => set("originalPrice", e.target.value === "" ? null : parseFloat(e.target.value))} placeholder="Optional" />
              </Field>
              <Field label="Stock">
                <input type="number" min="0" step="1" className={inputCls} value={form.stock} onChange={(e) => set("stock", e.target.value === "" ? 0 : parseInt(e.target.value, 10))} />
              </Field>
            </div>

            <Field label="Image URL">
              <input className={inputCls} value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." />
              {form.image && (
                <img src={form.image} alt="preview" className="mt-2 h-24 w-24 rounded-lg object-cover border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
            </Field>

            <Field label="Description">
              <textarea className={cn(inputCls, "min-h-[80px] resize-y")} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Product description..." />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 dark:border-dark-border">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink dark:border-dark-border dark:text-white/60">
            Cancel
          </button>
          <button
            onClick={() => { void handleSubmit(); }}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-600 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Table ─────────────────────────────────────────────────────────────────
const columnHelper = createColumnHelper<AdminProduct>();

export function ProductsTable() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editProduct, setEditProduct] = useState<AdminProduct | null | undefined>(undefined); // undefined=closed, null=new
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/products?limit=100`);
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const json = await res.json() as { success: boolean; data: AdminProduct[] };
      if (!json.success) throw new Error("API error");
      setProducts(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (hydrated) void fetchProducts(); }, [hydrated, fetchProducts]);

  const handleDelete = async (product: AdminProduct) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const id = product._id ?? product.id;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/v1/products/${id}`, {
        method: "DELETE",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error ?? "Delete failed");
      toast.success("Product deleted", product.name);
      setProducts((prev) => prev.filter((p) => (p._id ?? p.id) !== id));
    } catch (err) {
      toast.error("Failed to delete", err instanceof Error ? err.message : "Unknown");
    } finally { setDeletingId(null); }
  };

  const handleSaved = (saved: AdminProduct) => {
    setProducts((prev) => {
      const id = saved._id ?? saved.id;
      const idx = prev.findIndex((p) => (p._id ?? p.id) === id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
  };

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Product",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <img src={info.row.original.image} alt={info.getValue()} className="h-8 w-8 rounded-lg object-cover bg-surface-raised flex-shrink-0" />
          <span className="font-medium text-ink dark:text-white truncate max-w-[180px]">{info.getValue()}</span>
        </div>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => (
        <span className="rounded-full bg-amber-dim px-2 py-0.5 text-xs font-semibold text-amber dark:bg-amber/10">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("price", {
      header: "Price",
      cell: (info) => <span className="tabular-nums dark:text-white">${info.getValue().toFixed(2)}</span>,
    }),
    columnHelper.accessor("stock", {
      header: "Stock",
      cell: (info) => {
        const v = info.getValue();
        return (
          <span className={cn("font-semibold tabular-nums",
            v === 0 ? "text-red-500" : v <= 5 ? "text-amber" : "text-green-600 dark:text-green-400"
          )}>
            {v === 0 ? "Out of Stock" : v <= 5 ? `⚠ ${v}` : v}
          </span>
        );
      },
    }),
    columnHelper.accessor("rating", {
      header: "Rating",
      cell: (info) => <span className="tabular-nums text-amber">★ {info.getValue().toFixed(1)}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const p = info.row.original;
        const pid = p._id ?? p.id;
        const isDeleting = deletingId === pid;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditProduct(p)}
              className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-ink-muted transition-colors hover:border-primary hover:text-primary dark:border-dark-border"
            >
              <Pencil size={11} /> Edit
            </button>
            <button
              onClick={() => { void handleDelete(p); }}
              disabled={isDeleting}
              className="flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40 dark:border-red-900/30 dark:hover:bg-red-900/20"
            >
              {isDeleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
              Delete
            </button>
          </div>
        );
      },
    }),
  ], [deletingId]);

  const filteredData = useMemo(() =>
    selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory),
    [products, selectedCategory]
  );

  const table = useReactTable({
    data: filteredData, columns,
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
    <>
      {/* Modal */}
      {editProduct !== undefined && (
        <ProductModal
          product={editProduct}
          token={accessToken}
          onClose={() => setEditProduct(undefined)}
          onSaved={handleSaved}
        />
      )}

      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white dark:border-dark-border dark:bg-dark-surface">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4 dark:border-dark-border">
          <h2 className="font-serif text-lg font-normal dark:text-white">Products</h2>

          <button
            onClick={() => { void fetchProducts(); }}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-ink-muted hover:border-amber hover:text-amber disabled:opacity-40 dark:border-dark-border dark:text-white"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          {/* Add product button */}
          <button
            onClick={() => setEditProduct(null)}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-primary-600"
          >
            <Plus size={13} /> Add Product
          </button>

          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5">
            {["All", ...CATEGORIES].map((cat) => (
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

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-ink-muted">
            <Loader2 size={20} className="animate-spin" /><span className="text-sm">Loading…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={() => { void fetchProducts(); }} className="text-xs font-semibold text-amber underline">Retry</button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-t border-gray-200 text-sm dark:border-dark-border">
                <thead className="bg-white dark:bg-dark-surface">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-border dark:border-dark-border">
                      {hg.headers.map((header) => (
                        <th key={header.id} className="px-4 py-3 text-left">
                          {!header.isPlaceholder && (
                            <button
                              className={cn("flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500",
                                header.column.getCanSort() && "cursor-pointer hover:text-ink dark:hover:text-white"
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
                    <tr key={row.id} className={cn(
                      "border-b border-border/50 transition-colors hover:bg-amber-50 dark:border-dark-border dark:hover:bg-amber/5",
                      idx % 2 === 1 && "bg-gray-50 dark:bg-dark-surface-2/40",
                    )}>
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
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border p-4 dark:border-dark-border">
              <p className="text-xs text-ink-muted">
                {table.getFilteredRowModel().rows.length} products · Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
                  className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted hover:border-amber hover:text-amber disabled:opacity-30 dark:border-dark-border dark:text-white">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
                  className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted hover:border-amber hover:text-amber disabled:opacity-30 dark:border-dark-border dark:text-white">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
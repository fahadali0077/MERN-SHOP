"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, MapPin, Trash2, Edit2, Check, X, Home, Briefcase } from "lucide-react";

interface Address {
  id: string;
  label: string;
  type: "home" | "work" | "other";
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

const STORAGE_KEY = "mernshop_addresses";

const emptyForm = (): Omit<Address, "id" | "isDefault"> => ({
  label: "", type: "home", fullName: "", phone: "", street: "", city: "", state: "", country: "", postalCode: "",
});

function loadAddresses(): Address[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Address[]; } catch { return []; }
}
function saveAddresses(list: Address[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => { setAddresses(loadAddresses()); }, []);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.street.trim()) e.street = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.country.trim()) e.country = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    let updated: Address[];
    if (editId) {
      updated = addresses.map(a => a.id === editId ? { ...a, ...form } : a);
    } else {
      const newAddr: Address = { ...form, id: Date.now().toString(), isDefault: addresses.length === 0 };
      updated = [...addresses, newAddr];
    }
    saveAddresses(updated);
    setAddresses(updated);
    setShowForm(false); setEditId(null); setForm(emptyForm()); setErrors({});
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    if (addresses.find(a => a.id === id)?.isDefault && updated.length > 0) {
      updated[0]!.isDefault = true;
    }
    saveAddresses(updated);
    setAddresses(updated);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    saveAddresses(updated); setAddresses(updated);
  };

  const handleEdit = (addr: Address) => {
    setEditId(addr.id);
    setForm({ label: addr.label, type: addr.type, fullName: addr.fullName, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, country: addr.country, postalCode: addr.postalCode });
    setShowForm(true);
  };

  const field = (key: keyof typeof form, label: string, placeholder = "") => (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-muted dark:text-white/50">{label}</label>
      <input
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary dark:bg-dark-surface-2 dark:text-white ${errors[key] ? "border-red-400" : "border-border dark:border-dark-border"}`}
      />
      {errors[key] && <p className="mt-0.5 text-[11px] text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/account" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-raised dark:border-dark-border">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink dark:text-white">Addresses</h1>
            <p className="text-sm text-ink-muted">Shipping & billing info</p>
          </div>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm()); setErrors({}); }}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            <Plus size={15} /> Add Address
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-primary/30 bg-white p-6 dark:border-primary/20 dark:bg-dark-surface">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-ink dark:text-white">{editId ? "Edit Address" : "New Address"}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); setErrors({}); }} className="text-ink-muted hover:text-ink">
              <X size={18} />
            </button>
          </div>

          {/* Type selector */}
          <div className="mb-5 flex gap-2">
            {(["home", "work", "other"] as const).map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all ${form.type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-ink-muted dark:border-dark-border"}`}>
                {t === "home" ? <Home size={12} /> : t === "work" ? <Briefcase size={12} /> : <MapPin size={12} />}
                {t}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {field("label", "Address Label (optional)", "e.g. Mom's house")}
            {field("fullName", "Full Name *", "John Doe")}
            {field("phone", "Phone Number", "+1 234 567 8900")}
            {field("street", "Street Address *", "123 Main St")}
            {field("city", "City *", "New York")}
            {field("state", "State / Province", "NY")}
            {field("country", "Country *", "United States")}
            {field("postalCode", "Postal Code", "10001")}
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
              <Check size={15} /> {editId ? "Update" : "Save"} Address
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setErrors({}); }}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-surface-raised dark:border-dark-border">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white py-20 dark:border-dark-border dark:bg-dark-surface">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised dark:bg-dark-surface-2">
            <MapPin size={28} className="text-ink-muted" />
          </div>
          <h3 className="font-semibold text-ink dark:text-white">No addresses saved</h3>
          <p className="mt-1 text-sm text-ink-muted">Add a shipping address to speed up checkout</p>
        </div>
      )}

      <div className="space-y-3">
        {addresses.map(addr => (
          <div key={addr.id} className={`rounded-2xl border bg-white p-5 dark:bg-dark-surface transition-all ${addr.isDefault ? "border-primary/40 dark:border-primary/30" : "border-border dark:border-dark-border"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-raised dark:bg-dark-surface-2">
                  {addr.type === "home" ? <Home size={14} className="text-ink-muted" /> : addr.type === "work" ? <Briefcase size={14} className="text-ink-muted" /> : <MapPin size={14} className="text-ink-muted" />}
                </div>
                <span className="text-sm font-semibold text-ink dark:text-white capitalize">{addr.label || addr.type}</span>
                {addr.isDefault && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">Default</span>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="rounded-lg px-2 py-1 text-xs text-ink-muted hover:bg-surface-raised dark:hover:bg-dark-surface-2">
                    Set default
                  </button>
                )}
                <button onClick={() => handleEdit(addr)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-raised dark:hover:bg-dark-surface-2">
                  <Edit2 size={13} className="text-ink-muted" />
                </button>
                <button onClick={() => handleDelete(addr.id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10">
                  <Trash2 size={13} className="text-red-500" />
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm text-ink-muted leading-relaxed">
              <p>{addr.fullName}{addr.phone ? ` · ${addr.phone}` : ""}</p>
              <p>{addr.street}</p>
              <p>{[addr.city, addr.state, addr.postalCode].filter(Boolean).join(", ")}</p>
              <p>{addr.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

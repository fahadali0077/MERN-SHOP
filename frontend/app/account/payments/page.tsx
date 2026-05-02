"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, CreditCard, Trash2, Check, X, Star } from "lucide-react";

interface Card {
  id: string;
  nickname: string;
  type: "visa" | "mastercard" | "amex" | "other";
  last4: string;
  expMonth: string;
  expYear: string;
  holderName: string;
  isDefault: boolean;
}

const STORAGE_KEY = "mernshop_payment_methods";
const BRAND_COLORS: Record<string, string> = {
  visa: "from-blue-600 to-blue-800",
  mastercard: "from-red-500 to-orange-500",
  amex: "from-green-600 to-teal-700",
  other: "from-slate-600 to-slate-800",
};
const BRAND_LABEL: Record<string, string> = { visa: "VISA", mastercard: "MC", amex: "AMEX", other: "CARD" };

function detect(last4: string, type: Card["type"]) { return BRAND_LABEL[type] ?? "CARD"; }

function load(): Card[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Card[]; } catch { return []; }
}
function save(list: Card[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

const emptyForm = () => ({ nickname: "", type: "visa" as Card["type"], last4: "", expMonth: "", expYear: "", holderName: "" });

export default function PaymentsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => { setCards(load()); }, []);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!/^\d{4}$/.test(form.last4)) e.last4 = "Must be 4 digits";
    if (!form.holderName.trim()) e.holderName = "Required";
    if (!/^\d{2}$/.test(form.expMonth) || +form.expMonth < 1 || +form.expMonth > 12) e.expMonth = "MM";
    if (!/^\d{2}$/.test(form.expYear)) e.expYear = "YY";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const newCard: Card = { ...form, id: Date.now().toString(), isDefault: cards.length === 0 };
    const updated = [...cards, newCard];
    save(updated); setCards(updated); setShowForm(false); setForm(emptyForm()); setErrors({});
  };

  const handleDelete = (id: string) => {
    const updated = cards.filter(c => c.id !== id);
    if (cards.find(c => c.id === id)?.isDefault && updated.length > 0) updated[0]!.isDefault = true;
    save(updated); setCards(updated);
  };

  const handleSetDefault = (id: string) => {
    const updated = cards.map(c => ({ ...c, isDefault: c.id === id }));
    save(updated); setCards(updated);
  };

  const f = (key: keyof typeof form, label: string, placeholder = "", maxLen = 100) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-muted dark:text-white/50">{label}</label>
      <input maxLength={maxLen} value={form[key] as string}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary dark:bg-dark-surface-2 dark:text-white ${errors[key] ? "border-red-400" : "border-border dark:border-dark-border"}`}
      />
      {errors[key] && <p className="mt-0.5 text-[11px] text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/account" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-raised dark:border-dark-border dark:hover:bg-dark-surface-2">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink dark:text-white">Payment Methods</h1>
            <p className="text-sm text-ink-muted">Cards & payment options</p>
          </div>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setForm(emptyForm()); setErrors({}); }}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
            <Plus size={15} /> Add Card
          </button>
        )}
      </div>

      {/* Note */}
      <div className="mb-5 rounded-xl border border-amber/30 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber/20 dark:bg-amber/10 dark:text-amber-300">
        🔒 We store card references only (last 4 digits). No full card numbers are ever saved here.
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-primary/30 bg-white p-6 dark:border-primary/20 dark:bg-dark-surface">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-ink dark:text-white">Add Card Reference</h2>
            <button onClick={() => { setShowForm(false); setErrors({}); }}><X size={18} className="text-ink-muted" /></button>
          </div>
          {/* Card type */}
          <div className="mb-5 flex gap-2 flex-wrap">
            {(["visa", "mastercard", "amex", "other"] as const).map(t => (
              <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase transition-all ${form.type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-ink-muted dark:border-dark-border"}`}>
                {BRAND_LABEL[t]}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {f("holderName", "Cardholder Name *", "John Doe")}
            {f("last4", "Last 4 Digits *", "1234", 4)}
            {f("nickname", "Nickname (optional)", "Personal card")}
            <div className="grid grid-cols-2 gap-3">
              {f("expMonth", "Exp Month *", "MM", 2)}
              {f("expYear", "Exp Year *", "YY", 2)}
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600">
              <Check size={15} /> Save Card
            </button>
            <button onClick={() => { setShowForm(false); setErrors({}); }} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-surface-raised dark:border-dark-border dark:hover:bg-dark-surface-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Cards list */}
      {cards.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white py-20 dark:border-dark-border dark:bg-dark-surface">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised dark:bg-dark-surface-2">
            <CreditCard size={28} className="text-ink-muted" />
          </div>
          <h3 className="font-semibold text-ink dark:text-white">No cards saved</h3>
          <p className="mt-1 text-sm text-ink-muted">Add a card for faster checkout</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(card => (
          <div key={card.id} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${BRAND_COLORS[card.type]} p-5 text-white shadow-lg`}>
            {card.isDefault && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                <Star size={9} fill="currentColor" /> Default
              </div>
            )}
            <p className="text-lg font-bold tracking-widest">•••• •••• •••• {card.last4}</p>
            <p className="mt-3 text-sm opacity-80">{card.holderName}</p>
            <p className="text-xs opacity-60">{card.nickname || detect(card.last4, card.type)} · Exp {card.expMonth}/{card.expYear}</p>
            <div className="mt-4 flex items-center gap-2">
              {!card.isDefault && (
                <button onClick={() => handleSetDefault(card.id)} className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25">
                  Set default
                </button>
              )}
              <button onClick={() => handleDelete(card.id)} className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/40">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Mail, Smartphone, ShoppingBag, Package, Tag, Star, Megaphone } from "lucide-react";

const STORAGE_KEY = "mernshop_notifications";

interface NotifPrefs {
  email_orders: boolean;
  email_promotions: boolean;
  email_reviews: boolean;
  email_newsletter: boolean;
  push_orders: boolean;
  push_promotions: boolean;
  push_restock: boolean;
  push_account: boolean;
}

const DEFAULTS: NotifPrefs = {
  email_orders: true, email_promotions: false, email_reviews: true, email_newsletter: false,
  push_orders: true, push_promotions: false, push_restock: false, push_account: true,
};

function load(): NotifPrefs {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<NotifPrefs> }; }
  catch { return DEFAULTS; }
}

interface PrefItem { key: keyof NotifPrefs; icon: React.ElementType; label: string; desc: string; }

const EMAIL_PREFS: PrefItem[] = [
  { key: "email_orders", icon: ShoppingBag, label: "Order updates", desc: "Confirmation, shipping & delivery emails" },
  { key: "email_promotions", icon: Tag, label: "Promotions & deals", desc: "Sales, discounts and special offers" },
  { key: "email_reviews", icon: Star, label: "Review requests", desc: "Ask for product reviews after delivery" },
  { key: "email_newsletter", icon: Megaphone, label: "Newsletter", desc: "New arrivals, trends, and editorial content" },
];

const PUSH_PREFS: PrefItem[] = [
  { key: "push_orders", icon: Package, label: "Order status", desc: "Real-time updates on your orders" },
  { key: "push_promotions", icon: Tag, label: "Flash sales", desc: "Limited-time deals and flash sales" },
  { key: "push_restock", icon: Bell, label: "Back in stock", desc: "When wishlisted items are restocked" },
  { key: "push_account", icon: Smartphone, label: "Account activity", desc: "Sign-ins and security alerts" },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={onToggle}
      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-primary" : "bg-border dark:bg-dark-border"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setPrefs(load()); }, []);

  const toggle = (key: keyof NotifPrefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Section = ({ title, icon: Icon, items }: { title: string; icon: React.ElementType; items: PrefItem[] }) => (
    <div className="rounded-2xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface">
      <div className="flex items-center gap-2 border-b border-border px-6 py-4 dark:border-dark-border">
        <Icon size={15} className="text-primary" />
        <h2 className="text-sm font-semibold text-ink dark:text-white">{title}</h2>
      </div>
      {items.map(({ key, icon: ItemIcon, label, desc }, i) => (
        <div key={key} className={`flex items-center gap-4 px-6 py-4 ${i !== items.length - 1 ? "border-b border-border dark:border-dark-border" : ""}`}>
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface-raised dark:bg-dark-surface-2">
            <ItemIcon size={15} className="text-ink-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink dark:text-white">{label}</p>
            <p className="text-xs text-ink-muted">{desc}</p>
          </div>
          <Toggle on={prefs[key]} onToggle={() => toggle(key)} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/account" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-raised dark:border-dark-border dark:hover:bg-dark-surface-2">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-white">Notifications</h1>
          <p className="text-sm text-ink-muted">Email & push preferences</p>
        </div>
      </div>

      <div className="space-y-4">
        <Section title="Email Notifications" icon={Mail} items={EMAIL_PREFS} />
        <Section title="Push Notifications" icon={Bell} items={PUSH_PREFS} />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={handleSave}
          className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all ${saved ? "bg-green-500" : "bg-primary hover:bg-primary-600"}`}>
          {saved ? "✓ Saved!" : "Save Preferences"}
        </button>
        <button onClick={() => { setPrefs(DEFAULTS); setSaved(false); }}
          className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium hover:bg-surface-raised dark:border-dark-border dark:hover:bg-dark-surface-2">
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

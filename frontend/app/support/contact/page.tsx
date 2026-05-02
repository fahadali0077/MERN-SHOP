"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle, Clock, CheckCircle } from "lucide-react";

const REASONS = ["Order Issue", "Returns & Refunds", "Shipping Question", "Product Inquiry", "Account Help", "Other"];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", reason: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputCls =
    "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-surface dark:text-white";

  return (
    <div className="mx-auto max-w-4xl py-10">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
        <ArrowLeft size={15} /> Back to Home
      </Link>

      <div className="mb-8">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <MessageCircle size={26} className="text-primary" />
        </div>
        <h1 className="font-serif text-3xl text-ink dark:text-white">Contact Us</h1>
        <p className="mt-2 text-ink-muted">We typically respond within 24 hours on business days.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <div className="rounded-2xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
          {submitted ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle size={48} className="mb-4 text-green-500" />
              <h2 className="text-lg font-semibold text-ink dark:text-white">Message Sent!</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Thanks {form.name}, we'll get back to you at <strong>{form.email}</strong> within 24 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", reason: "", message: "" }); }}
                className="mt-6 rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink dark:border-dark-border dark:text-white/60"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Name *</label>
                  <input
                    required
                    className={inputCls}
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Email *</label>
                  <input
                    required
                    type="email"
                    className={inputCls}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Reason *</label>
                <select
                  required
                  className={inputCls}
                  value={form.reason}
                  onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                >
                  <option value="">Select a reason…</option>
                  {REASONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">Message *</label>
                <textarea
                  required
                  rows={5}
                  className={`${inputCls} resize-y`}
                  placeholder="Describe your issue in detail…"
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: "fahadj698@gmail.com", href: "mailto:fahadj698@gmail.com" },
            { icon: Phone, label: "Phone", value: "+92 309-9639354", href: "tel:+923099639354" },
            { icon: MapPin, label: "Address", value: "Lahore, Pakistan", href: "https://maps.google.com" },
          ].map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 hover:border-primary transition-colors dark:border-dark-border dark:bg-dark-surface"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={17} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
                <p className="text-sm font-medium text-ink dark:text-white">{value}</p>
              </div>
            </a>
          ))}

          <div className="rounded-xl border border-border bg-white p-4 dark:border-dark-border dark:bg-dark-surface">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
              <Clock size={14} className="text-primary" /> Support Hours
            </div>
            <p className="text-sm text-ink-muted">Mon – Fri: 9 AM – 6 PM PKT</p>
            <p className="text-sm text-ink-muted">Sat – Sun: 10 AM – 2 PM PKT</p>
          </div>
        </div>
      </div>
    </div>
  );
}

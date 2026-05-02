"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export default function SecurityPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.currentPassword) e.currentPassword = "Required";
    if (form.newPassword.length < 8) e.newPassword = "At least 8 characters";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (form.newPassword === form.currentPassword) e.newPassword = "New password must be different";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json() as { success: boolean; message: string };
      if (!data.success) throw new Error(data.message ?? "Failed");
      setStatus("success");
      setMessage("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const strength = (p: string) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const pw_strength = strength(form.newPassword);
  const strength_colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const strength_labels = ["", "Weak", "Fair", "Good", "Strong"];

  const PwField = ({ field, label, showKey }: { field: keyof typeof form; label: string; showKey: keyof typeof show }) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-muted dark:text-white/50">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? "text" : "password"}
          value={form[field]}
          onChange={e => { setForm(p => ({ ...p, [field]: e.target.value })); setStatus("idle"); }}
          className={`w-full rounded-lg border pr-10 pl-3 py-2.5 text-sm outline-none focus:border-primary dark:bg-dark-surface-2 dark:text-white ${errors[field] ? "border-red-400" : "border-border dark:border-dark-border"}`}
        />
        <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
          {show[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {errors[field] && <p className="mt-0.5 text-[11px] text-red-500">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/account" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-raised dark:border-dark-border dark:hover:bg-dark-surface-2">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-white">Security</h1>
          <p className="text-sm text-ink-muted">Password & account protection</p>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4 dark:border-dark-border">
          <Lock size={15} className="text-primary" />
          <h2 className="text-sm font-semibold text-ink dark:text-white">Change Password</h2>
        </div>
        <div className="space-y-4 p-6">
          <PwField field="currentPassword" label="Current Password" showKey="current" />
          <PwField field="newPassword" label="New Password" showKey="new" />

          {/* Strength meter */}
          {form.newPassword && (
            <div>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pw_strength ? strength_colors[pw_strength] : "bg-border dark:bg-dark-border"}`} />
                ))}
              </div>
              <p className="text-[11px] text-ink-muted">{strength_labels[pw_strength]}</p>
            </div>
          )}

          <PwField field="confirmPassword" label="Confirm New Password" showKey="confirm" />

          {status === "success" && (
            <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">✓ {message}</div>
          )}
          {status === "error" && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <div className="flex items-center gap-2"><AlertTriangle size={14} /> {message}</div>
            </div>
          )}

          <button onClick={() => { void handleSubmit(); }} disabled={status === "loading"}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60">
            {status === "loading" ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* Security tips */}
      <div className="mt-5 rounded-2xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={15} className="text-primary" />
          <h2 className="text-sm font-semibold text-ink dark:text-white">Security Tips</h2>
        </div>
        <ul className="space-y-2 text-sm text-ink-muted">
          {[
            "Use at least 8 characters with uppercase, numbers & symbols",
            "Never reuse passwords across different websites",
            "Enable notifications for sign-in activity",
            "Sign out from shared or public devices",
          ].map(tip => (
            <li key={tip} className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

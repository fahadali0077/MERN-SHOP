"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Save, Trash2, AlertTriangle, Check } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/stores/toastStore";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name ?? "", email: user.email ?? "" });
  }, [user]);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setStatus("loading"); setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim() }),
      });
      const data = await res.json() as { success: boolean; data?: { id: string; name: string; email: string; role: "customer" | "admin" }; message?: string };
      if (!data.success) throw new Error(data.message ?? "Update failed");
      if (data.data && accessToken) setAuth(data.data, accessToken);
      setStatus("success");
      toast.success("Profile updated", "Your changes have been saved.");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const isDirty = form.name !== (user?.name ?? "") || form.email !== (user?.email ?? "");

  const handleDeleteAccount = async () => {
    setShowDeleteDialog(false);
    try {
      await fetch(`${API_URL}/api/v1/auth/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch { /* ignore — clear local state regardless */ }
    logout();
    toast.success("Account deleted", "Sorry to see you go.");
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-lg">
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete your account?"
        description="This action is permanent. All your orders, wishlist, and data will be deleted and cannot be recovered."
        confirmLabel="Yes, delete account"
        cancelLabel="Keep my account"
        variant="danger"
        onConfirm={() => { void handleDeleteAccount(); }}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <div className="mb-6 flex items-center gap-3">
        <Link href="/account" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-raised dark:border-dark-border dark:hover:bg-dark-surface-2">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-white">Account Settings</h1>
          <p className="text-sm text-ink-muted">Personal info & privacy</p>
        </div>
      </div>

      {/* Profile info */}
      <div className="rounded-2xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4 dark:border-dark-border">
          <User size={15} className="text-primary" />
          <h2 className="text-sm font-semibold text-ink dark:text-white">Profile Information</h2>
        </div>
        <div className="space-y-4 p-6">
          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted dark:text-white/50">Full Name</label>
            <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setStatus("idle"); }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary dark:bg-dark-surface-2 dark:text-white ${errors.name ? "border-red-400" : "border-border dark:border-dark-border"}`}
              placeholder="Your full name" />
            {errors.name && <p className="mt-0.5 text-[11px] text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted dark:text-white/50">Email Address</label>
            <input value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setStatus("idle"); }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary dark:bg-dark-surface-2 dark:text-white ${errors.email ? "border-red-400" : "border-border dark:border-dark-border"}`}
              placeholder="your@email.com" />
            {errors.email && <p className="mt-0.5 text-[11px] text-red-500">{errors.email}</p>}
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted dark:text-white/50">Account Role</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2.5 dark:border-dark-border dark:bg-dark-surface-2">
              <span className="text-sm capitalize text-ink dark:text-white">{user?.role ?? "customer"}</span>
              <span className="ml-auto text-[11px] text-ink-muted">Cannot be changed</span>
            </div>
          </div>

          {status === "success" && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <Check size={14} /> Profile updated successfully
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <AlertTriangle size={14} /> {errorMsg}
            </div>
          )}

          <button onClick={() => { void handleSave(); }} disabled={!isDirty || status === "loading"}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50">
            <Save size={14} /> {status === "loading" ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-5 rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900/30 dark:bg-dark-surface">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={15} className="text-red-500" />
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
        </div>
        <p className="mb-4 text-sm text-ink-muted">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
          <Trash2 size={14} /> Delete Account
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/stores/toastStore";
import { cn } from "@/lib/utils";
import {
  Search, Loader2, RefreshCw, ChevronLeft, ChevronRight,
  User, ShieldCheck, Shield, Trash2, MoreHorizontal, Mail
} from "lucide-react";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

interface AdminUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "moderator";
  createdAt: string;
}
interface Pagination { page: number; limit: number; total: number; pages: number; }

const ROLE_STYLES = {
  admin:     "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber/10 dark:text-amber-300 dark:border-amber/20",
  moderator: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-500/20",
  customer:  "bg-surface-raised text-ink-muted border-border dark:bg-dark-surface-2 dark:text-white/50 dark:border-dark-border",
};
const ROLE_ICONS = { admin: ShieldCheck, moderator: Shield, customer: User } as const;

const AVATAR_COLORS = ["bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500","bg-pink-500","bg-red-500"];
const getInitials = (n: string) => n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
const getColor    = (n: string) => AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length] ?? "bg-violet-500";

export default function AdminUsersPage() {
  // ── Wait for Zustand hydration before using token ────────────────────────
  const accessToken   = useAuthStore((s) => s.accessToken);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const currentRole   = useAuthStore((s) => s.user?.role ?? "customer");
  const isAdmin = currentRole === "admin";
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const [users, setUsers]         = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page:1, limit:20, total:0, pages:1 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenu, setOpenMenu]   = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch(`${API_URL}/api/v1/users?${params.toString()}`, { headers });

      if (res.status === 401) { setError("Session expired — please sign in again."); return; }
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const json = await res.json() as { success: boolean; data: AdminUser[]; pagination: Pagination };
      if (!json.success) throw new Error("API returned success: false");
      setUsers(json.data);
      setPagination(json.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [accessToken, debouncedSearch]);

  // Only fetch after Zustand hydrates
  useEffect(() => {
    if (!hydrated) return;
    if (!hasFetched.current) {
      hasFetched.current = true;
      void fetchUsers(1);
    } else {
      void fetchUsers(1);
    }
  }, [hydrated, fetchUsers]);

  const handleRoleChange = async (userId: string, userName: string, newRole: string) => {
    setActionLoading(userId); setOpenMenu(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error ?? "Failed");
      toast.success("Role updated", `${userName} is now ${newRole}`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole as AdminUser["role"] } : u));
    } catch (err) {
      toast.error("Failed to update role", err instanceof Error ? err.message : "Unknown error");
    } finally { setActionLoading(null); }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`Delete "${userName}"? This cannot be undone.`)) return;
    setActionLoading(userId); setOpenMenu(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/users/${userId}`, {
        method: "DELETE",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error ?? "Failed");
      toast.success("User deleted", `${userName} removed`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setPagination(p => ({ ...p, total: p.total - 1 }));
    } catch (err) {
      toast.error("Failed to delete user", err instanceof Error ? err.message : "Unknown error");
    } finally { setActionLoading(null); }
  };

  const isLoading = loading || !hydrated;

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Users</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            {!isLoading && pagination.total > 0
              ? `${pagination.total} registered customer${pagination.total !== 1 ? "s" : ""}`
              : "Manage customer accounts"}
          </p>
        </div>
        <button
          onClick={() => { void fetchUsers(pagination.page); }}
          disabled={isLoading}
          className="flex items-center gap-1.5 self-start rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-amber hover:text-amber disabled:opacity-40 dark:border-dark-border"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-surface dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white dark:border-dark-border dark:bg-dark-surface">

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-20 text-ink-muted">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading users…</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={() => { void fetchUsers(); }} className="text-xs font-semibold text-amber underline">Retry</button>
          </div>
        )}

        {!isLoading && !error && users.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <User size={32} className="text-ink-muted/30" />
            <p className="text-sm text-ink-muted">No users found{debouncedSearch ? ` for "${debouncedSearch}"` : ""}</p>
          </div>
        )}

        {!isLoading && !error && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-raised/60 dark:border-dark-border dark:bg-dark-surface-2/40">
                  {["User","Role","Joined","Actions"].map(h => (
                    <th key={h} className={cn(
                      "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted",
                      h === "Actions" && "text-right"
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const uid = user._id ?? user.id ?? "";
                  const isMe = uid === currentUserId;
                  const RoleIcon = ROLE_ICONS[user.role] ?? User;
                  const isActioning = actionLoading === uid;

                  return (
                    <tr key={uid} className={cn(
                      "border-b border-border/50 transition-colors hover:bg-surface-raised/40 dark:border-dark-border/50 dark:hover:bg-dark-surface-2/30",
                      i % 2 === 1 && "bg-surface-raised/20 dark:bg-dark-surface-2/10"
                    )}>
                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white", getColor(user.name))}>
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink dark:text-white truncate">
                              {user.name}
                              {isMe && <span className="ml-2 text-[10px] font-normal text-ink-muted">(you)</span>}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-ink-muted truncate">
                              <Mail size={9} />{user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize", ROLE_STYLES[user.role])}>
                          <RoleIcon size={10} strokeWidth={2.5} />{user.role}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3.5 text-xs text-ink-muted">
                        {new Date(user.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        {isActioning
                          ? <Loader2 size={14} className="ml-auto animate-spin text-ink-muted" />
                          : !isAdmin
                          ? <span className="text-[10px] text-ink-muted/50">View only</span>
                          : (
                            <div className="relative inline-block">
                              <button
                                onClick={() => setOpenMenu(openMenu === uid ? null : uid)}
                                disabled={isMe}
                                className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs text-ink-muted transition-colors hover:border-ink/20 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 dark:border-dark-border dark:hover:text-white"
                              >
                                <MoreHorizontal size={13} />
                              </button>

                              {openMenu === uid && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                                  <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-white shadow-lg dark:border-dark-border dark:bg-dark-surface">
                                    <p className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:border-dark-border">
                                      Change Role
                                    </p>
                                    {(["customer","moderator","admin"] as const).filter(r => r !== user.role).map(role => (
                                      <button key={role}
                                        onClick={() => { void handleRoleChange(uid, user.name, role); }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm capitalize text-ink-soft transition-colors hover:bg-surface-raised dark:text-white/70 dark:hover:bg-dark-surface-2"
                                      >
                                        {role === "admin" ? <ShieldCheck size={13} className="text-amber" /> :
                                         role === "moderator" ? <Shield size={13} className="text-purple-500" /> :
                                         <User size={13} className="text-ink-muted" />}
                                        Make {role}
                                      </button>
                                    ))}
                                    <div className="border-t border-border dark:border-dark-border" />
                                    <button
                                      onClick={() => { void handleDelete(uid, user.name); }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 size={13} />Delete user
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 dark:border-dark-border">
            <p className="text-xs text-ink-muted">Page {pagination.page} of {pagination.pages} · {pagination.total} users</p>
            <div className="flex items-center gap-2">
              <button onClick={() => { void fetchUsers(pagination.page - 1); }} disabled={pagination.page <= 1}
                className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted transition-colors hover:border-amber hover:text-amber disabled:opacity-30 dark:border-dark-border">
                <ChevronLeft size={13} />
              </button>
              <button onClick={() => { void fetchUsers(pagination.page + 1); }} disabled={pagination.page >= pagination.pages}
                className="flex h-7 w-7 items-center justify-center rounded border border-border text-ink-muted transition-colors hover:border-amber hover:text-amber disabled:opacity-30 dark:border-dark-border">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

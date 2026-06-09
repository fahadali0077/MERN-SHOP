"use server";

import { cookies } from "next/headers";
import type { ActionResult, User } from "@/types";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

/**
 * FIX B14/B16/#2: a shared authenticated fetch helper. Reads the HttpOnly
 * accessToken cookie, calls the backend, and on 401 silently refreshes using the
 * refreshToken cookie (re-setting the accessToken cookie) and retries once.
 * Client components call the actions below; they never touch the token directly.
 */
async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  let token = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const doFetch = (t?: string) =>
    fetch(`${API}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      cache: "no-store",
    });

  let res = await doFetch(token);

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    });
    if (refreshRes.ok) {
      const rd = (await refreshRes.json()) as { success: boolean; data?: { accessToken: string } };
      if (rd.success && rd.data?.accessToken) {
        token = rd.data.accessToken;
        cookieStore.set("accessToken", token, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env["NODE_ENV"] === "production",
          maxAge: 60 * 15,
        });
        res = await doFetch(token);
      }
    }
  }

  return res;
}

// ── GET /api/v1/auth/me ───────────────────────────────────────────────────────
export async function getMeAction(): Promise<ActionResult<User>> {
  try {
    const res = await authedFetch("/api/v1/auth/me");
    const data = (await res.json()) as { success: boolean; data?: User; error?: string };
    if (!res.ok || !data.success || !data.data) {
      return { success: false, message: data.error ?? "Not authenticated", statusCode: res.status };
    }
    return { success: true, message: "ok", data: data.data };
  } catch {
    return { success: false, message: "Failed to load profile" };
  }
}

// ── PATCH /api/v1/auth/me ─────────────────────────────────────────────────────
export async function updateMeAction(
  fields: { name?: string; email?: string }
): Promise<ActionResult<User>> {
  try {
    const res = await authedFetch("/api/v1/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = (await res.json()) as { success: boolean; data?: User; message?: string; error?: string };
    if (!res.ok || !data.success) {
      return { success: false, message: data.error ?? data.message ?? "Update failed", statusCode: res.status };
    }
    return { success: true, message: data.message ?? "Profile updated", data: data.data };
  } catch {
    return { success: false, message: "Update failed. Please try again." };
  }
}

// ── POST /api/v1/auth/change-password ─────────────────────────────────────────
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  try {
    const res = await authedFetch("/api/v1/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = (await res.json()) as { success: boolean; message?: string; error?: string };
    if (!res.ok || !data.success) {
      return { success: false, message: data.error ?? "Could not change password", statusCode: res.status };
    }
    return { success: true, message: data.message ?? "Password changed" };
  } catch {
    return { success: false, message: "Could not change password." };
  }
}

// ── DELETE /api/v1/auth/me ────────────────────────────────────────────────────
export async function deleteMeAction(): Promise<ActionResult> {
  try {
    const res = await authedFetch("/api/v1/auth/me", { method: "DELETE" });
    // Always clear local cookies regardless of backend outcome (404 = already gone).
    const cookieStore = await cookies();
    cookieStore.delete("session");
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("mern_cart");

    if (!res.ok && res.status !== 404) {
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      return { success: false, message: data.message ?? "Could not delete account." };
    }
    return { success: true, message: "Account deleted." };
  } catch {
    return { success: false, message: "Could not delete account." };
  }
}

// ── GET /api/v1/orders/my ─────────────────────────────────────────────────────
export interface MyOrder {
  id: string;
  _id: string;
  items: { product: string; name: string; image?: string; price: number; qty: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress?: { street: string; city: string; country: string };
}

export async function getMyOrdersAction(
  page = 1,
  limit = 8
): Promise<ActionResult<{ orders: MyOrder[]; pages: number }>> {
  try {
    const res = await authedFetch(`/api/v1/orders/my?page=${page}&limit=${limit}`);
    if (res.status === 401) {
      return { success: false, message: "Your session has expired. Please sign in again.", statusCode: 401 };
    }
    const data = (await res.json()) as {
      success: boolean;
      data?: MyOrder[];
      pagination?: { pages: number };
      error?: string;
    };
    if (!res.ok || !data.success || !data.data) {
      return { success: false, message: data.error ?? "Failed to load orders", statusCode: res.status };
    }
    return {
      success: true,
      message: "ok",
      data: { orders: data.data, pages: data.pagination?.pages ?? 1 },
    };
  } catch {
    return { success: false, message: "Failed to load orders. Please try again." };
  }
}

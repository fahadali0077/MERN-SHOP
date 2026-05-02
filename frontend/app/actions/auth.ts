"use server";

import { cookies } from "next/headers";
import type { ActionResult } from "@/types";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

// ── Customer / Admin login — single endpoint, role-based cookie ───────────────
export async function loginAction(
  email: string,
  password: string
): Promise<ActionResult<{ accessToken: string; user: { name: string; email: string; role: string } }>> {
  try {
    const res = await fetch(`${API}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json() as {
      success: boolean;
      data?: { accessToken: string; user: { name: string; email: string; role: string } };
      error?: string;
    };

    if (!data.success || !data.data) {
      return { success: false, message: data.error ?? "Login failed" };
    }

    const cookieStore = await cookies();

    // Access token (short-lived, 15 min)
    cookieStore.set("accessToken", data.data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 15,
    });

    // Session cookie — role is read here by middleware to protect /admin
    cookieStore.set("session", JSON.stringify({
      name: data.data.user.name,
      email: data.data.user.email,
      role: data.data.user.role,
    }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, message: "Welcome back!", data: data.data };
  } catch (err) {
    console.error("[loginAction]", err);
    return { success: false, message: "Login failed. Please try again." };
  }
}

// ── Register ──────────────────────────────────────────────────────────────────
export async function registerAction(
  name: string,
  email: string,
  password: string
): Promise<ActionResult<{ accessToken: string }>> {
  try {
    const res = await fetch(`${API}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json() as {
      success: boolean;
      data?: { accessToken: string; user: { name: string; email: string; role: string } };
      error?: string;
      details?: Record<string, string[]>;
    };

    if (!data.success || !data.data) {
      return {
        success: false,
        message: data.error ?? "Registration failed",
        fieldErrors: data.details,
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("accessToken", data.data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 15,
    });
    cookieStore.set("session", JSON.stringify({
      name: data.data.user.name,
      email: data.data.user.email,
      role: data.data.user.role,
    }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, message: "Account created!", data: { accessToken: data.data.accessToken } };
  } catch (err) {
    console.error("[registerAction]", err);
    return { success: false, message: "Registration failed. Please try again." };
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<ActionResult> {
  try {
    await fetch(`${API}/api/v1/auth/logout`, { method: "POST" });

    const cookieStore = await cookies();
    cookieStore.delete("session");
    cookieStore.delete("accessToken");
    cookieStore.delete("mern_cart");

    return { success: true, message: "Logged out." };
  } catch (err) {
    console.error("[logoutAction]", err);
    return { success: false, message: "Logout failed." };
  }
}

// ── Kept for backwards compatibility — now just calls loginAction ─────────────
export async function adminLoginAction(
  email: string,
  password: string
): Promise<ActionResult<{ accessToken: string; user: { id: string; name: string; email: string; role: string; createdAt: string } }>> {
  const result = await loginAction(email, password);

  if (!result.success || !result.data) {
    return { success: false, message: result.message ?? "Login failed" };
  }

  if (result.data.user.role !== "admin") {
    return { success: false, message: "Access denied. Admin role required." };
  }

  return {
    success: true,
    message: "Welcome, Admin!",
    data: {
      accessToken: result.data.accessToken,
      user: {
        id: "",
        createdAt: "",
        ...result.data.user,
      },
    },
  };
}

// ── Admin logout ──────────────────────────────────────────────────────────────
export async function adminLogoutAction(): Promise<ActionResult> {
  return logoutAction();
}
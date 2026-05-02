"use server";

/**
 * MERN-III Module 4 — app/actions/auth.ts
 * Replaces mock cookie auth with real JWT calls to the Express backend.
 */

import { cookies } from "next/headers";
import type { ActionResult } from "@/types";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

// ── Customer login — calls POST /api/v1/auth/login ────────────────────────────
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

    // Store access token in HttpOnly cookie for middleware to read
    cookieStore.set("accessToken", data.data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 15, // 15 minutes (matches JWT expiry)
    });

    // Keep session cookie so middleware can protect routes
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
    if (data.data.user.role === "admin") {
      cookieStore.set("mernshop_admin", "true", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env["NODE_ENV"] === "production",
        maxAge: 60 * 60 * 8, // 8 hours — matches adminLoginAction
      });
    }

    return { success: true, message: "Welcome back!", data: data.data };
  } catch (err) {
    console.error("[loginAction]", err);
    return { success: false, message: "Login failed. Please try again." };
  }
}

// ── Customer register — calls POST /api/v1/auth/register ─────────────────────
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

// ── Customer logout — calls POST /api/v1/auth/logout ─────────────────────────
export async function logoutAction(): Promise<ActionResult> {
  try {
    await fetch(`${API}/api/v1/auth/logout`, {
      method: "POST",
    });

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

// ── Admin login — calls POST /api/v1/auth/login with admin role check ─────────
export async function adminLoginAction(
  email: string,
  password: string
): Promise<ActionResult<{ accessToken: string; user: { id: string; name: string; email: string; role: string; createdAt: string } }>> {
  try {
    const res = await fetch(`${API}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json() as {
      success: boolean;
      data?: { accessToken: string; user: { id: string; name: string; email: string; role: string; createdAt: string } };
      error?: string;
    };

    if (!data.success || !data.data) {
      return { success: false, message: data.error ?? "Login failed" };
    }

    if (data.data.user.role !== "admin") {
      return { success: false, message: "Access denied. Admin role required." };
    }

    const cookieStore = await cookies();
    cookieStore.set("mernshop_admin", "true", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 60 * 8, // 8 hours
    });
    cookieStore.set("accessToken", data.data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 15,
    });

    return { success: true, message: "Welcome, Admin!", data: { accessToken: data.data.accessToken, user: data.data.user } };
  } catch (err) {
    console.error("[adminLoginAction]", err);
    return { success: false, message: "Login failed." };
  }
}

// ── Admin logout ──────────────────────────────────────────────────────────────
export async function adminLogoutAction(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("mernshop_admin");
    cookieStore.delete("accessToken");
    return { success: true, message: "Logged out." };
  } catch (err) {
    console.error("[adminLogoutAction]", err);
    return { success: false, message: "Logout failed." };
  }
}

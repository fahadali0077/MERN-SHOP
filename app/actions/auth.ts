"use server";

import { cookies } from "next/headers";
import type { ActionResult } from "@/types";

const CART_COOKIE    = "mern_cart";
const SESSION_COOKIE = "session";
const ADMIN_COOKIE   = "mernshop_admin";
const ADMIN_EMAIL    = "admin@mernshop.com";
const ADMIN_PASSWORD = "Admin@1234";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

// ── Customer login ─────────────────────────────────────────────────────────────
export async function loginAction(
  email: string,
  password: string,
): Promise<ActionResult> {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: "Please enter a valid email address" };
    }
    if (!password || password.length < 8) {
      return { success: false, message: "Password must be at least 8 characters" };
    }

    const cookieStore = await cookies();

    // Set session cookie so middleware allows /account, /cart, /checkout
    cookieStore.set(SESSION_COOKIE, JSON.stringify({ email, role: "customer" }), {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Initialize empty cart cookie if not present
    if (!cookieStore.has(CART_COOKIE)) {
      cookieStore.set(CART_COOKIE, JSON.stringify([]), {
        ...COOKIE_OPTS,
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return { success: true, message: "Welcome back!" };
  } catch (err) {
    console.error("[loginAction]", err);
    return { success: false, message: "Login failed. Please try again." };
  }
}

// ── Customer logout ────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    cookieStore.delete(CART_COOKIE);
    return { success: true, message: "Logged out." };
  } catch (err) {
    console.error("[logoutAction]", err);
    return { success: false, message: "Logout failed." };
  }
}

// ── Admin login ────────────────────────────────────────────────────────────────
export async function adminLoginAction(
  email: string,
  password: string,
): Promise<ActionResult> {
  try {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return { success: false, message: "Invalid credentials. Access denied." };
    }
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE, "true", {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return { success: true, message: "Welcome, Admin!" };
  } catch (err) {
    console.error("[adminLoginAction]", err);
    return { success: false, message: "Login failed. Please try again." };
  }
}

// ── Admin logout ───────────────────────────────────────────────────────────────
export async function adminLogoutAction(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE);
    return { success: true, message: "Logged out." };
  } catch (err) {
    console.error("[adminLogoutAction]", err);
    return { success: false, message: "Logout failed." };
  }
}

"use server";

import { cookies } from "next/headers";
import type { ActionResult } from "@/types";

const CART_COOKIE  = "mern_cart";
const ADMIN_COOKIE = "mernshop_admin";
const ADMIN_EMAIL    = "admin@mernshop.com";
const ADMIN_PASSWORD = "Admin@1234";

// ── Customer login ─────────────────────────────────────────────────────────────
export async function loginAction(
  email: string,
  password: string,
): Promise<ActionResult> {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address" };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters" };
  }

  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, JSON.stringify([]), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });

  return { success: true, message: `Welcome back!` };
}

// ── Customer logout ────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<ActionResult> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
  return { success: true, message: "Logged out." };
}

// ── Admin login ────────────────────────────────────────────────────────────────
export async function adminLoginAction(
  email: string,
  password: string,
): Promise<ActionResult> {
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return { success: false, message: "Invalid credentials. Access denied." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });

  return { success: true, message: "Welcome, Admin!" };
}

// ── Admin logout ───────────────────────────────────────────────────────────────
export async function adminLogoutAction(): Promise<ActionResult> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  return { success: true, message: "Logged out." };
}

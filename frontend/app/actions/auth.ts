"use server";

import { cookies } from "next/headers";
import type { ActionResult } from "@/types";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

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
      status?: number;
    };

    if (!data.success || !data.data) {
      return {
        success: false,
        message: data.error ?? "Login failed",
        statusCode: res.status,
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

    return { success: true, message: "Welcome back!", data: data.data };
  } catch (err) {
    console.error("[loginAction]", err);
    return { success: false, message: "Login failed. Please try again." };
  }
}

export async function registerAction(
  name: string,
  email: string,
  password: string
): Promise<ActionResult<{ email: string; name: string }>> {
  try {
    const res = await fetch(`${API}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json() as {
      success: boolean;
      data?: { email: string; name: string };
      error?: string;
      details?: Record<string, string[]>;
    };

    if (!data.success) {
      return {
        success: false,
        message: data.error ?? "Registration failed",
        fieldErrors: data.details,
      };
    }

    return {
      success: true,
      message: data.error ?? "Check your email to verify your account.",
      data: data.data ?? { email, name },
    };
  } catch (err) {
    console.error("[registerAction]", err);
    return { success: false, message: "Registration failed. Please try again." };
  }
}

export async function verifyEmailAction(token: string): Promise<ActionResult<{ accessToken: string; user: { name: string; email: string; role: string } }>> {
  try {
    const res = await fetch(`${API}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: "GET",
    });

    const data = await res.json() as {
      success: boolean;
      data?: { accessToken: string; user: { name: string; email: string; role: string } };
      error?: string;
    };

    if (!data.success || !data.data) {
      return { success: false, message: data.error ?? "Verification failed" };
    }

    const cookieStore = await cookies();
    cookieStore.set("accessToken", data.data.accessToken, {
      httpOnly: true, sameSite: "lax", path: "/",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 15,
    });
    cookieStore.set("session", JSON.stringify({
      name: data.data.user.name,
      email: data.data.user.email,
      role: data.data.user.role,
    }), {
      httpOnly: true, sameSite: "lax", path: "/",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, message: "Email verified!", data: data.data };
  } catch (err) {
    console.error("[verifyEmailAction]", err);
    return { success: false, message: "Verification failed. Please try again." };
  }
}

export async function resendVerificationAction(email: string): Promise<ActionResult> {
  try {
    const res = await fetch(`${API}/api/v1/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json() as { success: boolean; message?: string };
    return { success: data.success, message: data.message ?? "Done" };
  } catch {
    return { success: false, message: "Failed to resend. Please try again." };
  }
}

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
      user: { id: "", createdAt: "", ...result.data.user },
    },
  };
}

export async function adminLogoutAction(): Promise<ActionResult> {
  return logoutAction();
}

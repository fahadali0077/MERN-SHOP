"use server";

import type { ActionResult } from "@/types";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

// ── POST /api/v1/auth/forgot-password ────────────────────────────────────────
export async function forgotPasswordAction(
  email: string
): Promise<ActionResult> {
  try {
    const res = await fetch(`${API}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = (await res.json()) as { success: boolean; message?: string; error?: string };

    if (!data.success) {
      return { success: false, message: data.error ?? "Something went wrong" };
    }

    return { success: true, message: data.message ?? "Reset link sent!" };
  } catch {
    return { success: false, message: "Failed to send reset email. Please try again." };
  }
}

// ── POST /api/v1/auth/reset-password ─────────────────────────────────────────
export async function resetPasswordAction(
  token: string,
  password: string
): Promise<ActionResult<{ accessToken: string }>> {
  try {
    const res = await fetch(`${API}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = (await res.json()) as {
      success: boolean;
      data?: { accessToken: string };
      message?: string;
      error?: string;
    };

    if (!data.success) {
      return { success: false, message: data.error ?? "Reset failed" };
    }

    return {
      success: true,
      message: data.message ?? "Password reset successfully!",
      data: data.data,
    };
  } catch {
    return { success: false, message: "Reset failed. Please try again." };
  }
}

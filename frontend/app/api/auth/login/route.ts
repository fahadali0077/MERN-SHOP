/**
 * MERN-III Module 4 — app/api/auth/login/route.ts
 * Proxies login to Express backend. Returns real JWT access token.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };

    const res = await fetch(`${API}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json() as {
      success: boolean;
      data?: { accessToken: string; user: { email: string; role: string } };
      error?: string;
    };

    if (!data.success || !data.data) {
      return NextResponse.json({ success: false, message: data.error ?? "Login failed" }, { status: res.status });
    }

    // Set cookies server-side
    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify({ name: (data.data.user as { name?: string }).name, email: data.data.user.email, role: data.data.user.role }), {
      httpOnly: true, sameSite: "lax", path: "/",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("accessToken", data.data.accessToken, {
      httpOnly: true, sameSite: "lax", path: "/",
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 15,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 });
  }
}

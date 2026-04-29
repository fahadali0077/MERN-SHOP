/**
 * MERN-III Module 4 — app/api/auth/logout/route.ts
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export async function POST() {
  try {
    // Tell backend to clear refreshToken from DB
    await fetch(`${API}/api/v1/auth/logout`, { method: "POST", credentials: "include" });

    const cookieStore = await cookies();
    cookieStore.delete("session");
    cookieStore.delete("accessToken");
    cookieStore.delete("mern_cart");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

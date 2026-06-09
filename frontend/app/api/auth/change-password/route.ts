/**
 * POST /api/auth/change-password
 * Proxies to backend /api/v1/auth/change-password with the HttpOnly accessToken.
 * Used by account/security page (FIX B14).
 */
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export async function POST(request: NextRequest) {
  const jar = await cookies();
  let token = jar.get("accessToken")?.value;
  const refreshToken = jar.get("refreshToken")?.value;
  const body = await request.text();

  const call = (t?: string) =>
    fetch(`${API}/api/v1/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
      body,
      cache: "no-store",
    });

  let res = await call(token);

  if (res.status === 401 && refreshToken) {
    const rr = await fetch(`${API}/api/v1/auth/refresh`, {
      method: "POST", headers: { Cookie: `refreshToken=${refreshToken}` }, cache: "no-store",
    });
    if (rr.ok) {
      const rd = (await rr.json()) as { success: boolean; data?: { accessToken: string } };
      if (rd.success && rd.data?.accessToken) {
        token = rd.data.accessToken;
        jar.set("accessToken", token, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env["NODE_ENV"] === "production", maxAge: 900 });
        res = await call(token);
      }
    }
  }

  const data: unknown = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

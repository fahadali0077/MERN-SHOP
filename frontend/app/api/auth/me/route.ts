/**
 * GET /api/auth/me
 *
 * FIX B14/B16/#8: client components can no longer read the access token
 * (it's HttpOnly and not persisted). This route handler reads the cookie token
 * server-side, calls the backend, and — if the access token has expired — uses
 * the refreshToken cookie to mint a new one, updates the cookie, and retries once.
 *
 * Returns the canonical user object ({ id, name, email, role, createdAt, ... }).
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

async function callMe(token: string) {
  return fetch(`${API}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!token && !refreshToken) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  // Try with the current access token.
  let res = token ? await callMe(token) : null;

  // If expired/absent, attempt a silent refresh using the refreshToken cookie.
  if ((!res || res.status === 401) && refreshToken) {
    const refreshRes = await fetch(`${API}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    });
    if (refreshRes.ok) {
      const refreshData = (await refreshRes.json()) as { success: boolean; data?: { accessToken: string } };
      if (refreshData.success && refreshData.data?.accessToken) {
        const newToken = refreshData.data.accessToken;
        cookieStore.set("accessToken", newToken, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env["NODE_ENV"] === "production",
          maxAge: 60 * 15,
        });
        res = await callMe(newToken);
      }
    }
  }

  if (!res || !res.ok) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

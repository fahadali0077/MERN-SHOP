// Shared authenticated proxy helper for admin API routes (FIX B16).
import { cookies } from "next/headers";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export async function adminFetch(backendPath: string, init: RequestInit = {}): Promise<Response> {
  const jar = await cookies();
  let token = jar.get("accessToken")?.value;
  const refreshToken = jar.get("refreshToken")?.value;

  const call = (t?: string): Promise<Response> =>
    fetch(`${API}${backendPath}`, {
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      cache: "no-store",
    });

  let res = await call(token);

  if (res.status === 401 && refreshToken) {
    const rr = await fetch(`${API}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    });
    if (rr.ok) {
      const rd = (await rr.json()) as { success: boolean; data?: { accessToken: string } };
      if (rd.success && rd.data?.accessToken) {
        token = rd.data.accessToken;
        jar.set("accessToken", token, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env["NODE_ENV"] === "production",
          maxAge: 60 * 15,
        });
        res = await call(token);
      }
    }
  }

  return res;
}

export async function proxyGet(request: Request, backendBase: string): Promise<Response> {
  const search = new URL(request.url).search;
  const res = await adminFetch(`${backendBase}${search}`);
  const data: unknown = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}

export async function proxyPost(request: Request, backendBase: string): Promise<Response> {
  const search = new URL(request.url).search;
  const body = await request.text();
  const res = await adminFetch(`${backendBase}${search}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data: unknown = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}

export async function proxyMutation(
  request: Request,
  method: "PUT" | "DELETE" | "PATCH",
  proxyPrefix: string,
  backendBase: string
): Promise<Response> {
  const { pathname, search } = new URL(request.url);
  const sub = pathname.replace(new RegExp(`^${proxyPrefix}`), "");
  const body = method !== "DELETE" ? await request.text() : undefined;
  const res = await adminFetch(`${backendBase}${sub}${search}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    ...(body ? { body } : {}),
  });
  const data: unknown = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}

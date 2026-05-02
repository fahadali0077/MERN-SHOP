import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * middleware.ts
 *
 * Single login page at /auth/login handles everyone.
 * Role is read from the "session" HttpOnly cookie set by loginAction.
 *
 * PROTECTED ROUTES:
 *   /admin/**   → requires session with role === "admin"
 *   /account    → requires any session
 *   /checkout   → requires non-admin session
 *
 * ALWAYS PUBLIC:
 *   /auth/**  /api/**  /_next/**
 */

const SESSION_COOKIE = "session";

const PUBLIC_PATHS = [
  "/auth/",
  "/api/",
  "/_next/",
  "/favicon",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function getSessionRole(request: NextRequest): string | null {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { role?: string };
    return parsed.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const role = getSessionRole(request);
  const isAdmin = role === "admin";
  const isLoggedIn = role !== null;

  // ── Admin routes ───────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isAdmin) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Block admin from customer-only pages ───────────────────────────────────
  const CUSTOMER_ONLY = ["/cart", "/checkout", "/wishlist"];
  if (isAdmin && CUSTOMER_ONLY.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // ── Protected customer pages ───────────────────────────────────────────────
  if (pathname.startsWith("/checkout") || pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
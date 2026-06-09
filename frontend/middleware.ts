import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "session";

// FIX #9: make the storefront pages EXPLICITLY public so guards can never
// accidentally gate them. Previously /products relied on the absence of a block.
const PUBLIC_PATHS = [
  "/auth/",
  "/api/",
  "/_next/",
  "/favicon",
  "/support/",
  "/legal/",
  "/products", // storefront listing + detail — always public
  "/", // home
];

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some((p) => (p === "/" ? false : pathname.startsWith(p)));
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

  // ── Protected customer pages (require any session) ─────────────────────────
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)"],
};

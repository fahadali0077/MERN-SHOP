import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * middleware.ts — Edge middleware running before every request.
 *
 * PROTECTED ROUTES:
 *   /admin/**      → requires mernshop_admin cookie (set on /admin/login)
 *   /checkout      → requires session cookie (set on login)
 *   /account       → requires session cookie
 *   /cart          → requires session cookie
 *
 * ALWAYS PUBLIC:
 *   /admin/login   → never redirected (would cause infinite loop)
 *   /auth/login    → never redirected
 *   /auth/register → never redirected
 *   /api/**        → never redirected
 */

const SESSION_COOKIE = "session";
const ADMIN_COOKIE   = "mernshop_admin";

const PUBLIC_PATHS = [
  "/admin/login",
  "/auth/login",
  "/auth/register",
  "/api/",
  "/_next/",
  "/favicon",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  // ── Admin protection ──────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!request.cookies.get(ADMIN_COOKIE)) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Customer session protection ───────────────────────────────────────────
  if (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/account") ||
    pathname === "/cart"
  ) {
    if (!request.cookies.get(SESSION_COOKIE)) {
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

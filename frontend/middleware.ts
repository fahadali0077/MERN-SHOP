import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * middleware.ts — Edge middleware running before every request.
 *
 * PROTECTED ROUTES:
 *   /admin/**      → requires mernshop_admin cookie (set on /admin/login)
 *   /checkout      → requires session cookie; admin blocked → redirected to /admin
 *   /cart          → admin blocked → redirected to /admin
 *   /account       → requires session cookie
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

  const isAdminSession    = !!request.cookies.get(ADMIN_COOKIE);
  const isCustomerSession = !!request.cookies.get(SESSION_COOKIE);

  // ── Admin protection ──────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isAdminSession) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Block admin from customer-only pages ──────────────────────────────────
  // Admin should never be shopping — redirect them back to their dashboard
  const CUSTOMER_ONLY = ["/cart", "/checkout", "/wishlist"];
  if (isAdminSession && CUSTOMER_ONLY.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // ── Customer session protection ───────────────────────────────────────────
  if (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/account")
  ) {
    if (!isCustomerSession) {
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

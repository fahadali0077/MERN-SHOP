import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CART_COOKIE } from "@/lib/session";

/**
 * middleware.ts — Edge middleware running before every request.
 *
 * PROTECTED ROUTES:
 *   /admin/**      → requires mernshop_admin cookie (set on /admin/login)
 *   /checkout      → requires mern_cart session cookie (set on login)
 *   /account       → requires mern_cart session cookie
 *   /cart          → requires mern_cart session cookie
 *
 * IMPORTANT — login pages are always public:
 *   /admin/login   → never redirected (would cause infinite loop)
 *   /auth/login    → never redirected
 *   /auth/register → never redirected
 *
 * MERN-IV UPGRADE:
 *   Replace cookie checks with: getToken({ req }) from next-auth/jwt
 *   Check token.role === "admin" for admin routes.
 */

const ADMIN_COOKIE = "mernshop_admin";

// Paths that must always be publicly accessible
const PUBLIC_PATHS = [
  "/admin/login",
  "/auth/login",
  "/auth/register",
  "/api/",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static assets and public paths
  if (isPublic(pathname)) return NextResponse.next();

  // ── Admin protection ─────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!request.cookies.get(ADMIN_COOKIE)) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Customer session protection ──────────────────────────────────────────
  if (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/account") ||
    pathname === "/cart"
  ) {
    if (!request.cookies.get(CART_COOKIE)) {
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

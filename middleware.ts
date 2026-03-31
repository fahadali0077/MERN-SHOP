import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CART_COOKIE } from "@/lib/session";


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

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIE = "session";
const CART_COOKIE    = "mern_cart";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, JSON.stringify({ email, role: "customer" }), {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 7,
    });

    if (!cookieStore.has(CART_COOKIE)) {
      cookieStore.set(CART_COOKIE, JSON.stringify([]), {
        ...COOKIE_OPTS,
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}

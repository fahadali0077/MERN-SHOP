import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as { email: string; password: string };

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address" });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters" });
    }

    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify({ email }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
      secure: true,
    });

    // existing cart cookie
    cookieStore.set("mern_cart", JSON.stringify([]), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
      secure: true,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
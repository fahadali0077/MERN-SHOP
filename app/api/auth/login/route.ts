import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const MOCK_USER = { email: "test@test.com", password: "password123" };

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as {
      email: string;
      password: string;
    };

    // Validation — 400 for bad input
    if (!email || !email.includes("@")) {
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

    // Mock auth check — 401 for wrong credentials
    if (email !== MOCK_USER.email || password !== MOCK_USER.password) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("session", JSON.stringify({ email }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production", // ✅ not hardcoded true
    });

    cookieStore.set("mern_cart", JSON.stringify([]), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
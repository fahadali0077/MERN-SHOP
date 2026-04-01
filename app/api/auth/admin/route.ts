import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_EMAIL    = "admin@mernshop.com";
const ADMIN_PASSWORD = "Admin@1234";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as { email: string; password: string };

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, message: "Invalid credentials. Access denied." });
    }

    const cookieStore = await cookies();
    cookieStore.set("mernshop_admin", "true", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ success: true, message: "Welcome, Admin!" });
  } catch {
    return NextResponse.json({ success: false, message: "Login failed. Please try again." }, { status: 500 });
  }
}

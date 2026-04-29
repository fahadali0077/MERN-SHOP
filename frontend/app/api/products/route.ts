import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ApiResponse, Product } from "@/types";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const res = await fetch(`${API_URL}/api/v1/products?${searchParams.toString()}`, {
      next: { revalidate: 60 },
    });
    const data = (await res.json()) as ApiResponse<Product[]>;
    return NextResponse.json(data, {
      status: res.status,
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate" },
    });
  } catch (error) {
    console.error("[GET /api/products → backend]", error);
    return NextResponse.json(
      { success: false as const, error: "Failed to reach backend", code: "BACKEND_UNREACHABLE" },
      { status: 502 }
    );
  }
}

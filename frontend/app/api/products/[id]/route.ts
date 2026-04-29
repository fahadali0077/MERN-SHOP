/**
 * MERN-III Module 3 — app/api/products/[id]/route.ts
 * Product IDs are now MongoDB ObjectIds (24 hex chars), not p-NNN format.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ApiResponse, Product } from "@/types";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const { id } = await params;
    if (!id?.trim()) {
      return NextResponse.json(
        { success: false as const, error: "Product ID required", code: "INVALID_ID" },
        { status: 400 }
      );
    }
    const res = await fetch(`${API_URL}/api/v1/products/${id}`, {
      next: { revalidate: 300 },
    });
    const data = (await res.json()) as ApiResponse<Product>;
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[GET /api/products/[id] → backend]", error);
    return NextResponse.json(
      { success: false as const, error: "Failed to reach backend", code: "BACKEND_UNREACHABLE" },
      { status: 502 }
    );
  }
}

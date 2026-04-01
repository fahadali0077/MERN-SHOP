import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchProductById } from "@/lib/products";
import { z } from "zod";
import type { ApiResponse, Product } from "@/types";

const ParamSchema = z.object({
  id: z
    .string()
    .min(1, "ID is required")
    .regex(/^p-\d{3}$/, "Product ID must match format p-NNN (e.g. p-001)"),
});


export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const rawParams = await params;
    const parsed = ParamSchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false as const,
          error: parsed.error.issues[0]?.message ?? "Invalid product ID",
          code: "INVALID_ID",
        },
        { status: 400 },
      );
    }

    const { id } = parsed.data;
    const product = await fetchProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false as const, error: `Product "${id}" not found`, code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true as const, data: product },
      { status: 200, headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate" } },
    );
  } catch (error) {
    console.error("[GET /api/products/[id]]", error);
    return NextResponse.json(
      { success: false as const, error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchProducts } from "@/lib/products";
import { ProductsQuerySchema } from "@/schemas";
import type { ApiResponse, Product } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query params into a plain object for Zod
    const rawParams = Object.fromEntries(searchParams.entries());

    const parsed = ProductsQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false as const,
          error: "Invalid query parameters",
          code: "VALIDATION_ERROR",
          // Attach field-level errors so API consumers know exactly what's wrong
          ...{ details: parsed.error.flatten().fieldErrors },
        },
        { status: 400 },
      );
    }

    const { category, sort } = parsed.data;

    let products = await fetchProducts();

    if (category && category !== "All") {
      products = products.filter((p) => p.category === category);
    }

    if (sort === "price-asc") products = [...products].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") products = [...products].sort((a, b) => b.price - a.price);
    if (sort === "rating-desc") products = [...products].sort((a, b) => b.rating - a.rating);
    if (sort === "reviews-desc") products = [...products].sort((a, b) => b.reviewCount - a.reviewCount);

    return NextResponse.json(
      { success: true as const, data: products, message: `${products.length} products` },
      { status: 200, headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate" } },
    );
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { success: false as const, error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}

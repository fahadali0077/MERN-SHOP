import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCart, getSessionCartTotal } from "@/lib/session";
import { CartItemSchema } from "@/schemas";
import type { ApiResponse, CartItem } from "@/types";

/**
 * GET /api/cart
 *
 * Returns the current session cart as JSON.
 * Validates each cart item against CartItemSchema for data integrity.
 *
 * Use case: mobile app or external client reading the cart.
 * The /cart page reads the cookie directly (Server Component) — this
 * endpoint is for external consumers.
 */
export async function GET(
  _request: NextRequest,
): Promise<NextResponse<ApiResponse<CartItem[]>>> {
  try {
    const cart = await getSessionCart();
    const total = await getSessionCartTotal();

    // Validate every item in the cart matches our expected shape
    // This guards against corrupted cookie data
    const validatedItems: CartItem[] = [];
    const invalidItems: string[] = [];

    for (const item of cart) {
      const result = CartItemSchema.safeParse(item);
      if (result.success) {
        validatedItems.push(result.data);
      } else {
        invalidItems.push(item.product?.id ?? "unknown");
        console.warn("[GET /api/cart] Invalid cart item:", result.error.flatten());
      }
    }

    return NextResponse.json({
      success: true as const,
      data: validatedItems,
      message: `${validatedItems.length} items, total $${total.toFixed(2)}`,
      ...(invalidItems.length > 0 && { warnings: `Skipped ${invalidItems.length} invalid items` }),
    });
  } catch (error) {
    console.error("[GET /api/cart]", error);
    return NextResponse.json(
      { success: false as const, error: "Failed to read cart", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}

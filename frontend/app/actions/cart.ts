"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { fetchProductById } from "@/lib/products";
import {
  getSessionCart,
  setSessionCart,
  clearSessionCart,
  addItemToCart,
  removeItemFromCart,
  updateItemQtyInCart,
} from "@/lib/session";
import { AddToCartInputSchema, UpdateQtyInputSchema } from "@/schemas";
import type { ActionResult, CartItem } from "@/types";

/**
 * FIX #1/D30: every cart action now returns the FULL updated cart (not just a
 * count) so the in-memory mirror store can be synced from the action's return
 * value, keeping the navbar badge, drawer, /cart, and /checkout consistent.
 */
interface CartResult {
  items: CartItem[];
  count: number;
}

function summarize(items: CartItem[]): CartResult {
  return { items, count: items.reduce((s, i) => s + i.qty, 0) };
}

export async function addToCart(productId: string, qty = 1): Promise<ActionResult<CartResult>> {
  const parsed = AddToCartInputSchema.safeParse({ productId, qty });
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<Record<string, string[]>>,
    };
  }

  try {
    const product = await fetchProductById(parsed.data.productId);
    if (!product) {
      return { success: false, message: `Product "${parsed.data.productId}" not found` };
    }

    const cart = await getSessionCart();
    const updated = addItemToCart(cart, product, parsed.data.qty);
    await setSessionCart(updated);
    revalidatePath("/cart");

    return { success: true, message: `${product.name} added to cart`, data: summarize(updated) };
  } catch (error) {
    console.error("[addToCart]", error);
    return { success: false, message: "Failed to add item to cart" };
  }
}

export async function removeFromCart(productId: string): Promise<ActionResult<CartResult>> {
  const parsed = AddToCartInputSchema.pick({ productId: true }).safeParse({ productId });
  if (!parsed.success) return { success: false, message: "Invalid product ID" };

  try {
    const cart = await getSessionCart();
    const updated = removeItemFromCart(cart, parsed.data.productId);
    await setSessionCart(updated);
    revalidatePath("/cart");

    return { success: true, message: "Item removed from cart", data: summarize(updated) };
  } catch (error) {
    console.error("[removeFromCart]", error);
    return { success: false, message: "Failed to remove item" };
  }
}

export async function updateCartQty(productId: string, qty: number): Promise<ActionResult<CartResult>> {
  const parsed = UpdateQtyInputSchema.safeParse({ productId, qty });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<Record<string, string[]>>,
    };
  }

  try {
    const cart = await getSessionCart();
    const updated = updateItemQtyInCart(cart, parsed.data.productId, parsed.data.qty);
    await setSessionCart(updated);
    revalidatePath("/cart");

    return { success: true, message: "Cart updated", data: summarize(updated) };
  } catch (error) {
    console.error("[updateCartQty]", error);
    return { success: false, message: "Failed to update quantity" };
  }
}

export async function clearCart(): Promise<ActionResult<CartResult>> {
  try {
    await clearSessionCart();
    revalidatePath("/cart");
    return { success: true, message: "Cart cleared", data: summarize([]) };
  } catch (error) {
    console.error("[clearCart]", error);
    return { success: false, message: "Failed to clear cart" };
  }
}

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

/**
 * FIX #2: order creation runs server-side. It reads the cart from the SAME source
 * the cart page uses (the cookie), authenticates with the HttpOnly accessToken
 * cookie, refreshes on 401, and clears the cookie cart on success. The checkout
 * page no longer sends a token from Zustand or reads an empty Zustand cart.
 */
export async function createOrderAction(shippingAddress: {
  street: string;
  city: string;
  country: string;
}): Promise<ActionResult<{ id: string; totalAmount: number; items: CartItem[] }>> {
  try {
    const cart = await getSessionCart();
    if (cart.length === 0) {
      return { success: false, message: "Your cart is empty." };
    }

    const cookieStore = await cookies();
    let token = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    const body = JSON.stringify({
      items: cart.map((i) => ({ productId: i.product.id, qty: i.qty })),
      shippingAddress,
    });

    const post = (t?: string) =>
      fetch(`${API}/api/v1/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
        body,
        cache: "no-store",
      });

    let res = await post(token);

    if (res.status === 401 && refreshToken) {
      const refreshRes = await fetch(`${API}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { Cookie: `refreshToken=${refreshToken}` },
        cache: "no-store",
      });
      if (refreshRes.ok) {
        const rd = (await refreshRes.json()) as { success: boolean; data?: { accessToken: string } };
        if (rd.success && rd.data?.accessToken) {
          token = rd.data.accessToken;
          cookieStore.set("accessToken", token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: process.env["NODE_ENV"] === "production",
            maxAge: 60 * 15,
          });
          res = await post(token);
        }
      }
    }

    const data = (await res.json()) as {
      success: boolean;
      data?: { id?: string; _id?: string; totalAmount: number };
      error?: string;
    };

    if (res.status === 401) {
      return { success: false, message: "Please sign in to place your order.", statusCode: 401 };
    }
    if (!res.ok || !data.success || !data.data) {
      return { success: false, message: data.error ?? "Order failed. Please try again.", statusCode: res.status };
    }

    const id = String(data.data.id ?? data.data._id ?? "");

    // Snapshot items for the confirmation screen BEFORE clearing.
    const placedItems = cart;
    await clearSessionCart();
    revalidatePath("/cart");

    return {
      success: true,
      message: "Order placed successfully",
      data: { id, totalAmount: data.data.totalAmount, items: placedItems },
    };
  } catch (error) {
    console.error("[createOrderAction]", error);
    return { success: false, message: "Network error. Please try again." };
  }
}

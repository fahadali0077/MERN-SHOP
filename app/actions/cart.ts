"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { fetchProductById } from "@/lib/products";
import {
  CART_COOKIE,
  getSessionCart,
  setSessionCart,
  clearSessionCart,
  addItemToCart,
  removeItemFromCart,
  updateItemQtyInCart,
} from "@/lib/session";
import { AddToCartInputSchema, UpdateQtyInputSchema } from "@/schemas";
import type { ActionResult } from "@/types";

// ── addToCart ─────────────────────────────────────────────────────────────────
export async function addToCart(productId: string, qty = 1): Promise<ActionResult<number>> {
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

    const cartCount = updated.reduce((sum, i) => sum + i.qty, 0);
    return { success: true, message: `${product.name} added to cart`, data: cartCount };
  } catch (error) {
    console.error("[addToCart]", error);
    return { success: false, message: "Failed to add item to cart" };
  }
}

// ── removeFromCart ────────────────────────────────────────────────────────────
export async function removeFromCart(productId: string): Promise<ActionResult<number>> {
  const parsed = AddToCartInputSchema.pick({ productId: true }).safeParse({ productId });
  if (!parsed.success) return { success: false, message: "Invalid product ID" };

  try {
    const cart = await getSessionCart();
    const updated = removeItemFromCart(cart, parsed.data.productId);
    await setSessionCart(updated);
    revalidatePath("/cart");

    const cartCount = updated.reduce((sum, i) => sum + i.qty, 0);
    return { success: true, message: "Item removed from cart", data: cartCount };
  } catch (error) {
    console.error("[removeFromCart]", error);
    return { success: false, message: "Failed to remove item" };
  }
}

// ── updateCartQty ─────────────────────────────────────────────────────────────
export async function updateCartQty(productId: string, qty: number): Promise<ActionResult<number>> {
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

    const cartCount = updated.reduce((sum, i) => sum + i.qty, 0);
    return { success: true, message: "Cart updated", data: cartCount };
  } catch (error) {
    console.error("[updateCartQty]", error);
    return { success: false, message: "Failed to update quantity" };
  }
}

// ── clearCart ─────────────────────────────────────────────────────────────────
export async function clearCart(): Promise<ActionResult<number>> {
  try {
    await clearSessionCart();
    revalidatePath("/cart");
    return { success: true, message: "Cart cleared", data: 0 };
  } catch (error) {
    console.error("[clearCart]", error);
    return { success: false, message: "Failed to clear cart" };
  }
}

// ── loginAction ───────────────────────────────────────────────────────────────
const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function loginAction(email: string, password: string): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid credentials" };
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set(CART_COOKIE, JSON.stringify([]), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return {
      success: true,
      message: `Welcome back, ${parsed.data.email.split("@")[0]}!`,
    };
  } catch (error) {
    console.error("[loginAction]", error);
    return { success: false, message: "Login failed. Please try again." };
  }
}

// ── logoutAction ──────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<ActionResult> {
  try {
    await clearSessionCart();
    revalidatePath("/");
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("[logoutAction]", error);
    return { success: false, message: "Logout failed" };
  }
}

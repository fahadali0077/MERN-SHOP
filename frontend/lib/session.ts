import { cookies } from "next/headers";
import type { CartItem, Product } from "@/types";

export const CART_COOKIE    = "mern_cart";
export const SESSION_COOKIE = "session";

export type SessionCartItem = CartItem;
export type SessionCart = SessionCartItem[];

export interface SessionUser {
  name?: string;
  email: string;
  role: "customer" | "admin";
}

// ── Session readers ───────────────────────────────────────────────────────────

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function hasSessionCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(SESSION_COOKIE);
}

// ── Cart readers ──────────────────────────────────────────────────────────────

export async function getSessionCart(): Promise<SessionCart> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SessionCart;
  } catch {
    return [];
  }
}

export async function getSessionCartCount(): Promise<number> {
  const cart = await getSessionCart();
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

export async function getSessionCartTotal(): Promise<number> {
  const cart = await getSessionCart();
  return cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
}

// ── Cart writers ──────────────────────────────────────────────────────────────

export async function setSessionCart(cart: SessionCart): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCart(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}

// ── Pure cart helpers (no I/O) ────────────────────────────────────────────────

export function addItemToCart(
  cart: SessionCart,
  product: Product,
  qty: number,
): SessionCart {
  const existing = cart.find((i) => i.product.id === product.id);
  if (existing) {
    return cart.map((i) =>
      i.product.id === product.id ? { ...i, qty: i.qty + qty } : i,
    );
  }
  return [...cart, { product, qty }];
}

export function removeItemFromCart(cart: SessionCart, productId: string): SessionCart {
  return cart.filter((i) => i.product.id !== productId);
}

export function updateItemQtyInCart(
  cart: SessionCart,
  productId: string,
  qty: number,
): SessionCart {
  if (qty <= 0) return removeItemFromCart(cart, productId);
  return cart.map((i) => (i.product.id === productId ? { ...i, qty } : i));
}

"use server";

import { cookies } from "next/headers";
import type { ActionResult } from "@/types";

const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000";

export interface Review {
  _id: string;
  user: { name: string; avatarUrl?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

// ── GET /api/v1/products/:id/reviews ─────────────────────────────────────────
export async function fetchReviews(productId: string): Promise<Review[]> {
  try {
    const res = await fetch(`${API}/api/v1/products/${productId}/reviews`, {
      next: { revalidate: 60 },
    });
    const data = (await res.json()) as { success: boolean; data: Review[] };
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

// ── POST /api/v1/products/:id/reviews ─────────────────────────────────────────
export async function submitReviewAction(
  productId: string,
  rating: number,
  comment: string
): Promise<ActionResult<Review>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return { success: false, message: "You must be signed in to leave a review." };
    }

    const res = await fetch(`${API}/api/v1/products/${productId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    });

    const data = (await res.json()) as {
      success: boolean;
      data?: Review;
      error?: string;
    };

    if (!data.success) {
      return { success: false, message: data.error ?? "Failed to submit review" };
    }

    return { success: true, message: "Review submitted!", data: data.data };
  } catch {
    return { success: false, message: "Failed to submit review. Please try again." };
  }
}

// ── DELETE /api/v1/products/:id/reviews/:reviewId ────────────────────────────
export async function deleteReviewAction(
  productId: string,
  reviewId: string
): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated." };
    }

    const res = await fetch(
      `${API}/api/v1/products/${productId}/reviews/${reviewId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = (await res.json()) as { success: boolean; error?: string };

    if (!data.success) {
      return { success: false, message: data.error ?? "Failed to delete review" };
    }

    return { success: true, message: "Review deleted." };
  } catch {
    return { success: false, message: "Failed to delete review." };
  }
}

"use client";

import { useState, useTransition } from "react";
import { Star, Loader2, UserCircle2, Trash2 } from "lucide-react";
import { submitReviewAction, deleteReviewAction } from "@/app/actions/reviews";
import type { Review } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { toast } from "@/stores/toastStore";
import { cn } from "@/lib/utils";

// ── Star picker ───────────────────────────────────────────────────────────────
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="group" aria-label="Pick a rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            size={24}
            className={cn(
              "transition-colors",
              n <= (hovered || value)
                ? "fill-amber text-amber"
                : "fill-none text-border dark:text-dark-border"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ── Single review card ────────────────────────────────────────────────────────
function ReviewCard({
  review,
  productId,
  isAdmin,
  onDeleted,
}: {
  review: Review;
  productId: string;
  isAdmin: boolean;
  onDeleted: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteReviewAction(productId, review._id);
      if (result.success) {
        toast.success("Review deleted");
        onDeleted(review._id);
      } else {
        toast.error("Failed to delete", result.message);
      }
    });
  };

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-white p-5 dark:border-dark-border dark:bg-dark-surface">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {review.user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.user.avatarUrl}
            alt={review.user.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <UserCircle2 size={40} className="text-border dark:text-dark-border" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm text-ink dark:text-white">
              {review.user.name}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={13}
                    className={cn(
                      n <= review.rating
                        ? "fill-amber text-amber"
                        : "fill-none text-border dark:text-dark-border"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-ink-muted">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Admin delete */}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex-shrink-0 rounded-md p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
              aria-label="Delete review"
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          )}
        </div>

        {review.comment && (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-ink-muted">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Write-a-review form ───────────────────────────────────────────────────────
function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted: (review: Review) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    startTransition(async () => {
      const result = await submitReviewAction(productId, rating, comment);
      if (!result.success) {
        setError(result.message);
        return;
      }
      toast.success("Review submitted!", "Thanks for your feedback.");
      if (result.data) onSubmitted(result.data);
      setRating(0);
      setComment("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-5 dark:border-dark-border dark:bg-dark-surface space-y-4">
      <h3 className="font-semibold text-sm text-ink dark:text-white">Write a review</h3>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
          Your rating
        </p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted"
        >
          Comment <span className="normal-case font-normal">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Share your experience with this product…"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber/30 dark:border-dark-border dark:bg-dark-surface dark:text-white resize-none transition-colors"
        />
        <p className="mt-1 text-right text-xs text-ink-muted">
          {comment.length}/500
        </p>
      </div>

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? (
          <><Loader2 size={14} className="animate-spin" /> Submitting…</>
        ) : (
          "Submit review"
        )}
      </Button>
    </form>
  );
}

// ── Main Reviews section ──────────────────────────────────────────────────────
interface ReviewsSectionProps {
  productId: string;
  initialReviews: Review[];
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function ReviewsSection({
  productId,
  initialReviews,
  isAuthenticated,
  isAdmin,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const handleNewReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
  };

  const handleDeleted = (id: string) => {
    setReviews((prev) => prev.filter((r) => r._id !== id));
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-6">
      {/* Section header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl font-normal text-ink dark:text-white">
            Customer Reviews
          </h2>
          {reviews.length > 0 && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={16}
                    className={cn(
                      n <= Math.round(avgRating)
                        ? "fill-amber text-amber"
                        : "fill-none text-border dark:text-dark-border"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-ink-muted">
                {avgRating.toFixed(1)} out of 5 &bull; {reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Review list */}
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center dark:border-dark-border">
              <Star size={32} className="mx-auto mb-3 text-border dark:text-dark-border" />
              <p className="text-sm font-medium text-ink dark:text-white">No reviews yet</p>
              <p className="mt-1 text-sm text-ink-muted">Be the first to review this product.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                productId={productId}
                isAdmin={isAdmin}
                onDeleted={handleDeleted}
              />
            ))
          )}
        </div>

        {/* Write review / sign-in prompt */}
        <div className="lg:sticky lg:top-24">
          {isAuthenticated ? (
            <ReviewForm productId={productId} onSubmitted={handleNewReview} />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center dark:border-dark-border">
              <p className="text-sm font-medium text-ink dark:text-white">
                Sign in to leave a review
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Share your thoughts with other shoppers.
              </p>
              <a
                href="/auth/login"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-600"
              >
                Sign in
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
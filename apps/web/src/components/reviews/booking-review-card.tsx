"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { api, createAuthHeaders, getApiErrorMessage, type ApiResponse } from "@/lib/api";
import type { Booking, Review } from "@/types/app";

function formatDate(isoString: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
  }).format(new Date(isoString));
}

type BookingReviewCardProps = {
  booking: Booking;
  token: string;
  review?: Review;
  onCreated: (review: Review) => void;
  onError: (message: string | null) => void;
};

export function BookingReviewCard({
  booking,
  token,
  review,
  onCreated,
  onError,
}: BookingReviewCardProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  if (review) {
    return (
      <section className="mt-4 rounded-[1.25rem] border border-[color:var(--pc-line)] bg-white px-4 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[color:var(--pc-ink)]">
              Your review
            </p>
            <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
              Submitted on {formatDate(review.createdAt)}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pc-surface)] px-3 py-2 text-sm font-medium text-[color:var(--pc-ink)]">
            <Star className="h-4 w-4 fill-current text-[color:var(--pc-gold)]" />
            {review.rating}/5
          </span>
        </div>
        <p className="mt-3 text-sm leading-7 text-[color:var(--pc-muted)]">
          {review.comment ?? "You left a rating without written feedback."}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-[1.25rem] border border-[color:var(--pc-line)] bg-white px-4 py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[color:var(--pc-ink)]">
            Leave a review
          </p>
          <p className="mt-1 text-sm text-[color:var(--pc-muted)]">
            Completed appointments can now turn into public doctor feedback.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => {
            const isActive = value === rating;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[color:var(--pc-ink)] text-white"
                    : "border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] text-[color:var(--pc-ink)] hover:border-[color:var(--pc-sky)]"
                }`}
              >
                <Star className={`h-4 w-4 ${isActive ? "fill-current" : ""}`} />
                {value}
              </button>
            );
          })}
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-[color:var(--pc-ink)]">
          Written feedback
        </span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          maxLength={800}
          placeholder="Share what went well, how the consultation felt, or what made the visit helpful."
          className="mt-2 w-full rounded-[1.2rem] border border-[color:var(--pc-line)] bg-[color:var(--pc-surface)] px-4 py-3 text-sm text-[color:var(--pc-ink)] outline-none transition focus:border-[color:var(--pc-sky)]"
        />
      </label>

      {localError ? (
        <div className="mt-4 rounded-[1rem] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {localError}
        </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            startTransition(() => {
              void api
                .post<ApiResponse<Review>>(
                  "/reviews",
                  {
                    bookingId: booking.id,
                    rating,
                    comment,
                  },
                  {
                    headers: createAuthHeaders(token),
                  },
                )
                .then((response) => {
                  setLocalError(null);
                  onError(null);
                  onCreated(response.data.data);
                })
                .catch((error) => {
                  const message = getApiErrorMessage(
                    error,
                    "Unable to submit your review right now.",
                  );
                  setLocalError(message);
                  onError(message);
                });
            });
          }}
          className="rounded-full bg-[color:var(--pc-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Submitting..." : "Submit review"}
        </button>
      </div>
    </section>
  );
}

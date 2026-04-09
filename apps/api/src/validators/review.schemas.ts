import { z } from "zod";

export const createReviewSchema = z.object({
  bookingId: z.string().trim().min(1, "Booking is required."),
  rating: z
    .coerce.number()
    .int("Rating must be a whole number.")
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating cannot be more than 5."),
  comment: z.string().trim().max(800).optional().or(z.literal("")),
});

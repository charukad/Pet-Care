import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate-body";
import { createReview, listReviewsForUser } from "../store";
import { createReviewSchema } from "../validators/review.schemas";

const reviewsRouter = Router();

reviewsRouter.use(requireAuth);
reviewsRouter.use(requireRoles("user"));

reviewsRouter.get("/me", async (request, response) => {
  response.json({
    success: true,
    data: await listReviewsForUser(request.user!.id),
  });
});

reviewsRouter.post(
  "/",
  validateBody(createReviewSchema),
  async (request, response) => {
    const review = await createReview({
      actor: request.user!,
      bookingId: request.body.bookingId,
      rating: request.body.rating,
      comment: request.body.comment,
    });

    response.status(201).json({
      success: true,
      data: review,
    });
  },
);

export { reviewsRouter };

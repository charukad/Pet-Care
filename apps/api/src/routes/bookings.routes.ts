import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate-body";
import {
  createBooking,
  listBookingsForDoctor,
  listBookingsForUser,
  updateBookingStatus,
} from "../store/demo-store";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "../validators/booking.schemas";

const bookingsRouter = Router();

bookingsRouter.use(requireAuth);

bookingsRouter.get("/me", requireRoles("user"), (request, response) => {
  response.json({
    success: true,
    data: listBookingsForUser(request.user!.id),
  });
});

bookingsRouter.post(
  "/",
  requireRoles("user"),
  validateBody(createBookingSchema),
  (request, response) => {
    const booking = createBooking({
      userId: request.user!.id,
      doctorProfileId: request.body.doctorProfileId,
      petId: request.body.petId,
      scheduledAt: request.body.scheduledAt,
      consultationMode: request.body.consultationMode,
      notes: request.body.notes,
    });

    response.status(201).json({
      success: true,
      data: booking,
    });
  },
);

bookingsRouter.get("/doctor/me", requireRoles("doctor"), (request, response) => {
  response.json({
    success: true,
    data: listBookingsForDoctor(request.user!.doctorProfileId!),
  });
});

bookingsRouter.patch(
  "/:bookingId/status",
  requireRoles("doctor"),
  validateBody(updateBookingStatusSchema),
  (request, response) => {
    const rawBookingId = request.params.bookingId;
    const bookingId = Array.isArray(rawBookingId)
      ? rawBookingId[0]
      : rawBookingId;

    if (!bookingId) {
      response.status(400).json({
        success: false,
        message: "Booking id is required.",
      });
      return;
    }

    const booking = updateBookingStatus({
      bookingId,
      doctorProfileId: request.user!.doctorProfileId!,
      status: request.body.status,
      rejectionReason: request.body.rejectionReason,
    });

    response.json({
      success: true,
      data: booking,
    });
  },
);

export { bookingsRouter };

import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate-body";
import {
  cancelBooking,
  createBooking,
  listBookingsForDoctor,
  listBookingsForUser,
  rescheduleBooking,
  updateBookingStatus,
} from "../store";
import {
  cancelBookingSchema,
  createBookingSchema,
  rescheduleBookingSchema,
  updateBookingStatusSchema,
} from "../validators/booking.schemas";

const bookingsRouter = Router();

bookingsRouter.use(requireAuth);

bookingsRouter.get("/me", requireRoles("user"), async (request, response) => {
  response.json({
    success: true,
    data: await listBookingsForUser(request.user!.id),
  });
});

bookingsRouter.post(
  "/",
  requireRoles("user"),
  validateBody(createBookingSchema),
  async (request, response) => {
    const booking = await createBooking({
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

bookingsRouter.get("/doctor/me", requireRoles("doctor"), async (request, response) => {
  response.json({
    success: true,
    data: await listBookingsForDoctor(request.user!.doctorProfileId!),
  });
});

bookingsRouter.patch(
  "/:bookingId/reschedule",
  requireRoles("user"),
  validateBody(rescheduleBookingSchema),
  async (request, response) => {
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

    const booking = await rescheduleBooking({
      bookingId,
      userId: request.user!.id,
      scheduledAt: request.body.scheduledAt,
    });

    response.json({
      success: true,
      data: booking,
    });
  },
);

bookingsRouter.patch(
  "/:bookingId/cancel",
  requireRoles("user"),
  validateBody(cancelBookingSchema),
  async (request, response) => {
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

    const booking = await cancelBooking({
      bookingId,
      userId: request.user!.id,
      reason: request.body.reason,
    });

    response.json({
      success: true,
      data: booking,
    });
  },
);

bookingsRouter.patch(
  "/:bookingId/status",
  requireRoles("doctor"),
  validateBody(updateBookingStatusSchema),
  async (request, response) => {
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

    const booking = await updateBookingStatus({
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

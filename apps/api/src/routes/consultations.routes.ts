import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { getConsultationAccess } from "../store";

const consultationsRouter = Router();

consultationsRouter.use(requireAuth, requireRoles("user", "doctor"));

consultationsRouter.get("/:bookingId/access", async (request, response) => {
  const rawBookingId = request.params.bookingId;
  const bookingId = Array.isArray(rawBookingId) ? rawBookingId[0] : rawBookingId;

  if (!bookingId) {
    response.status(400).json({
      success: false,
      message: "Booking id is required.",
    });
    return;
  }

  response.json({
    success: true,
    data: await getConsultationAccess(request.user!, bookingId),
  });
});

export { consultationsRouter };

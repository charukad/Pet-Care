import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate-body";
import {
  createPrescription,
  getMedicalHistoryForUser,
  listPrescriptionsForBooking,
  listPrescriptionsForDoctor,
  listPrescriptionsForUser,
} from "../store/demo-store";
import { createPrescriptionSchema } from "../validators/prescription.schemas";

const prescriptionsRouter = Router();

prescriptionsRouter.use(requireAuth);

prescriptionsRouter.get("/me", requireRoles("user"), (request, response) => {
  response.json({
    success: true,
    data: listPrescriptionsForUser(request.user!.id),
  });
});

prescriptionsRouter.get(
  "/doctor/me",
  requireRoles("doctor"),
  (request, response) => {
    response.json({
      success: true,
      data: listPrescriptionsForDoctor(request.user!.doctorProfileId!),
    });
  },
);

prescriptionsRouter.get(
  "/booking/:bookingId",
  requireRoles("doctor"),
  (request, response) => {
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
      data: listPrescriptionsForBooking(request.user!.doctorProfileId!, bookingId),
    });
  },
);

prescriptionsRouter.post(
  "/",
  requireRoles("doctor"),
  validateBody(createPrescriptionSchema),
  (request, response) => {
    const prescription = createPrescription({
      actor: request.user!,
      bookingId: request.body.bookingId,
      diagnosis: request.body.diagnosis,
      notes: request.body.notes,
      followUp: request.body.followUp,
      medicines: request.body.medicines,
    });

    response.status(201).json({
      success: true,
      data: prescription,
    });
  },
);

const medicalHistoryRouter = Router();

medicalHistoryRouter.use(requireAuth);
medicalHistoryRouter.use(requireRoles("user"));

medicalHistoryRouter.get("/me", (request, response) => {
  response.json({
    success: true,
    data: getMedicalHistoryForUser(request.user!.id),
  });
});

export { medicalHistoryRouter, prescriptionsRouter };

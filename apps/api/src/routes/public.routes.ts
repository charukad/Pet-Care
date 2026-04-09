import { Router } from "express";
import {
  getDoctorAvailabilityForDate,
  getPublicDoctorBySlug,
  listPublicDoctors,
} from "../store";

const publicRouter = Router();

publicRouter.get("/doctors", async (_request, response) => {
  response.json({
    success: true,
    data: await listPublicDoctors(),
  });
});

publicRouter.get("/doctors/:doctorProfileId/availability", async (request, response) => {
  const rawDoctorProfileId = request.params.doctorProfileId;
  const doctorProfileId = Array.isArray(rawDoctorProfileId)
    ? rawDoctorProfileId[0]
    : rawDoctorProfileId;
  const rawDateParam = Array.isArray(request.query.date)
    ? request.query.date[0]
    : request.query.date;
  const dateParam =
    typeof rawDateParam === "string" ? rawDateParam : undefined;

  if (!doctorProfileId) {
    response.status(400).json({
      success: false,
      message: "Doctor id is required.",
    });
    return;
  }

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    response.status(400).json({
      success: false,
      message: "A valid date is required in YYYY-MM-DD format.",
    });
    return;
  }

  response.json({
    success: true,
    data: await getDoctorAvailabilityForDate(doctorProfileId, dateParam),
  });
});

publicRouter.get("/doctors/:slug", async (request, response) => {
  const rawSlug = request.params.slug;
  const slug =
    typeof rawSlug === "string"
      ? rawSlug
      : Array.isArray(rawSlug)
        ? rawSlug[0]
        : undefined;
  const doctor = slug ? await getPublicDoctorBySlug(slug) : null;

  if (!doctor) {
    response.status(404).json({
      success: false,
      message: "Doctor not found.",
    });
    return;
  }

  response.json({
    success: true,
    data: doctor,
  });
});

export { publicRouter };

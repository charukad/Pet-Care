import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate-body";
import { getDoctorAvailability, updateDoctorAvailability } from "../store";
import { updateDoctorAvailabilitySchema } from "../validators/doctor.schemas";

const doctorsRouter = Router();

doctorsRouter.use(requireAuth, requireRoles("doctor"));

doctorsRouter.get("/me/availability", async (request, response) => {
  response.json({
    success: true,
    data: await getDoctorAvailability(request.user!.doctorProfileId!),
  });
});

doctorsRouter.put(
  "/me/availability",
  validateBody(updateDoctorAvailabilitySchema),
  async (request, response) => {
    response.json({
      success: true,
      data: await updateDoctorAvailability({
        doctorProfileId: request.user!.doctorProfileId!,
        availability: request.body.availability,
        availabilityOverrides: request.body.availabilityOverrides,
        blockedSlots: request.body.blockedSlots,
      }),
    });
  },
);

export { doctorsRouter };

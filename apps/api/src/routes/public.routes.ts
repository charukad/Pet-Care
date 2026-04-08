import { Router } from "express";
import { mockDoctors } from "../data/mock-doctors";

const publicRouter = Router();

publicRouter.get("/doctors", (_request, response) => {
  response.json({
    success: true,
    data: mockDoctors,
  });
});

publicRouter.get("/doctors/:slug", (request, response) => {
  const doctor = mockDoctors.find(({ slug }) => slug === request.params.slug);

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

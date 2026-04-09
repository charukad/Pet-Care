import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({
    success: true,
    message: "Pet Care API is healthy.",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

export { healthRouter };

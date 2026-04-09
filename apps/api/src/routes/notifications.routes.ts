import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
  syncAppointmentReminders,
} from "../store";

const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get("/me", async (request, response) => {
  const rawLimit = request.query.limit;
  const limitValue = Array.isArray(rawLimit) ? rawLimit[0] : rawLimit;
  const parsedLimit =
    typeof limitValue === "string" ? Number.parseInt(limitValue, 10) : undefined;
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : undefined;

  await syncAppointmentReminders(request.user!);

  response.json({
    success: true,
    data: await listNotificationsForUser(request.user!.id, {
      limit,
    }),
  });
});

notificationsRouter.patch("/:notificationId/read", async (request, response) => {
  const rawNotificationId = request.params.notificationId;
  const notificationId = Array.isArray(rawNotificationId)
    ? rawNotificationId[0]
    : rawNotificationId;

  if (!notificationId) {
    response.status(400).json({
      success: false,
      message: "Notification id is required.",
    });
    return;
  }

  response.json({
    success: true,
    data: await markNotificationRead(request.user!.id, notificationId),
  });
});

notificationsRouter.patch("/read-all", async (request, response) => {
  response.json({
    success: true,
    data: await markAllNotificationsRead(request.user!.id),
  });
});

export { notificationsRouter };

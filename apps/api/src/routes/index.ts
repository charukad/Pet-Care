import { Router } from "express";
import { adminRouter } from "./admin.routes";
import { authRouter } from "./auth.routes";
import { bookingsRouter } from "./bookings.routes";
import { healthRouter } from "./health.routes";
import { petsRouter } from "./pets.routes";
import { publicRouter } from "./public.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/health", healthRouter);
apiRouter.use("/public", publicRouter);
apiRouter.use("/pets", petsRouter);
apiRouter.use("/bookings", bookingsRouter);
apiRouter.use("/admin", adminRouter);

export { apiRouter };

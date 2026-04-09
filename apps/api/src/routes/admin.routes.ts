import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { getAdminOverview } from "../store";

const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRoles("admin"));

adminRouter.get("/overview", async (_request, response) => {
  response.json({
    success: true,
    data: await getAdminOverview(),
  });
});

export { adminRouter };

import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { getAdminOverview } from "../store/demo-store";

const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRoles("admin"));

adminRouter.get("/overview", (_request, response) => {
  response.json({
    success: true,
    data: getAdminOverview(),
  });
});

export { adminRouter };

import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate-body";
import { authenticateUser, registerUser } from "../store";
import { signAuthToken } from "../utils/jwt";
import { loginSchema, registerSchema } from "../validators/auth.schemas";

const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), async (request, response) => {
  const user = await registerUser(request.body);
  const token = signAuthToken(user);

  response.status(201).json({
    success: true,
    data: {
      token,
      user,
    },
  });
});

authRouter.post("/login", validateBody(loginSchema), async (request, response) => {
  const user = await authenticateUser(request.body.email, request.body.password);
  const token = signAuthToken(user);

  response.json({
    success: true,
    data: {
      token,
      user,
    },
  });
});

authRouter.get("/me", requireAuth, (request, response) => {
  response.json({
    success: true,
    data: request.user,
  });
});

export { authRouter };

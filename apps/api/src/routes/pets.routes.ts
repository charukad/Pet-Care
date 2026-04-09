import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate-body";
import { createPet, listPetsForUser } from "../store";
import { createPetSchema } from "../validators/pet.schemas";

const petsRouter = Router();

petsRouter.use(requireAuth);
petsRouter.use(requireRoles("user"));

petsRouter.get("/", async (request, response) => {
  response.json({
    success: true,
    data: await listPetsForUser(request.user!.id),
  });
});

petsRouter.post("/", validateBody(createPetSchema), async (request, response) => {
  const pet = await createPet({
    userId: request.user!.id,
    name: request.body.name,
    type: request.body.type,
    breed: request.body.breed,
    age: request.body.age,
    sex: request.body.sex,
  });

  response.status(201).json({
    success: true,
    data: pet,
  });
});

export { petsRouter };

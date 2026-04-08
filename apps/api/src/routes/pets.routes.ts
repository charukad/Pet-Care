import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate-body";
import { createPet, listPetsForUser } from "../store/demo-store";
import { createPetSchema } from "../validators/pet.schemas";

const petsRouter = Router();

petsRouter.use(requireAuth);
petsRouter.use(requireRoles("user"));

petsRouter.get("/", (request, response) => {
  response.json({
    success: true,
    data: listPetsForUser(request.user!.id),
  });
});

petsRouter.post("/", validateBody(createPetSchema), (request, response) => {
  const pet = createPet({
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

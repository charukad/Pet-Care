import { z } from "zod";

export const createPetSchema = z.object({
  name: z.string().trim().min(1, "Pet name is required."),
  type: z.string().trim().min(1, "Pet type is required."),
  breed: z.string().trim().max(60).optional().or(z.literal("")),
  age: z.coerce
    .number()
    .min(0, "Age cannot be negative.")
    .max(100, "Age looks too large.")
    .optional(),
  sex: z.enum(["male", "female", "unknown"]).default("unknown"),
});

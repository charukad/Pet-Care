import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(12).default("pet-care-dev-secret"),
  JWT_EXPIRES_IN: z.string().min(2).default("7d"),
});

export const env = envSchema.parse(process.env);

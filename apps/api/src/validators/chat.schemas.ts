import { z } from "zod";

export const createChatMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message content is required.")
    .max(1000, "Messages must be 1000 characters or fewer."),
});

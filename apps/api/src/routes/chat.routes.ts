import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate-body";
import {
  createChatMessage,
  getConversationDetails,
  listConversationsForActor,
  listMessagesForConversation,
} from "../store";
import { createChatMessageSchema } from "../validators/chat.schemas";

const chatRouter = Router();

chatRouter.use(requireAuth);
chatRouter.use(requireRoles("user", "doctor"));

chatRouter.get("/conversations", async (request, response) => {
  response.json({
    success: true,
    data: await listConversationsForActor(request.user!),
  });
});

chatRouter.get("/conversations/:conversationId", async (request, response) => {
  const rawConversationId = request.params.conversationId;
  const conversationId = Array.isArray(rawConversationId)
    ? rawConversationId[0]
    : rawConversationId;

  if (!conversationId) {
    response.status(400).json({
      success: false,
      message: "Conversation id is required.",
    });
    return;
  }

  response.json({
    success: true,
    data: {
      details: await getConversationDetails(conversationId),
      messages: await listMessagesForConversation(request.user!, conversationId),
    },
  });
});

chatRouter.post(
  "/conversations/:conversationId/messages",
  validateBody(createChatMessageSchema),
  async (request, response) => {
    const rawConversationId = request.params.conversationId;
    const conversationId = Array.isArray(rawConversationId)
      ? rawConversationId[0]
      : rawConversationId;

    if (!conversationId) {
      response.status(400).json({
        success: false,
        message: "Conversation id is required.",
      });
      return;
    }

    const message = await createChatMessage({
      actor: request.user!,
      conversationId,
      content: request.body.content,
    });

    response.status(201).json({
      success: true,
      data: message,
    });
  },
);

export { chatRouter };

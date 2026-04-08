import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate-body";
import {
  createChatMessage,
  getConversationDetails,
  listConversationsForActor,
  listMessagesForConversation,
} from "../store/demo-store";
import { createChatMessageSchema } from "../validators/chat.schemas";

const chatRouter = Router();

chatRouter.use(requireAuth);
chatRouter.use(requireRoles("user", "doctor"));

chatRouter.get("/conversations", (request, response) => {
  response.json({
    success: true,
    data: listConversationsForActor(request.user!),
  });
});

chatRouter.get("/conversations/:conversationId", (request, response) => {
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
      details: getConversationDetails(conversationId),
      messages: listMessagesForConversation(request.user!, conversationId),
    },
  });
});

chatRouter.post(
  "/conversations/:conversationId/messages",
  validateBody(createChatMessageSchema),
  (request, response) => {
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

    const message = createChatMessage({
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

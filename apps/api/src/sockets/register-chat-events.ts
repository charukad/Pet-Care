import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env";

type ChatPayload = {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "doctor";
  createdAt: string;
};

export function registerSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("chat:join", (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on("chat:leave", (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on("chat:message", (payload: ChatPayload) => {
      io.to(payload.conversationId).emit("chat:message", payload);
    });
  });

  return io;
}

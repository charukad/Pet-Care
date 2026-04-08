import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env";

type ChatPayload = {
  conversationId: string;
  message: string;
  senderId: string;
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

    socket.on("chat:message", (payload: ChatPayload) => {
      io.to(payload.conversationId).emit("chat:message", {
        ...payload,
        createdAt: new Date().toISOString(),
      });
    });
  });

  return io;
}

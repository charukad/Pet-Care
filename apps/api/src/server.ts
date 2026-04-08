import { createServer } from "node:http";
import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { registerSocketServer } from "./sockets/register-chat-events";

async function startServer() {
  const app = createApp();
  const httpServer = createServer(app);

  registerSocketServer(httpServer);
  await connectDatabase(env.MONGODB_URI);

  httpServer.listen(env.PORT, () => {
    console.info(`Pet Care API listening on http://localhost:${env.PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start Pet Care API.", error);
  process.exit(1);
});

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function startServer() {
  const { Server } = await import("socket.io");
  const { httpServer } = await import("./server");
  const { registerConnectionHandler } =
    await import("./handlers/connection.handler");
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.APP_URL,
      credentials: true,
    },
  });
  registerConnectionHandler(io);
  const PORT = Number(process.env.SOCKET_PORT) || 4000;
  httpServer.listen(PORT, () => {
    console.log(`Socket Server running on port ${PORT}`);
  });
}
startServer();

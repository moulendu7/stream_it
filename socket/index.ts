import { Server } from "socket.io";

import { httpServer } from "./server";
import { registerConnectionHandler } from "./handlers/connection.handler";

export const io = new Server(httpServer, {
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

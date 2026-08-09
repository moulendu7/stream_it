import { Server, Socket } from "socket.io";

import { registerRoomEvents } from "../events/room.events";
import { SessionService } from "../services/session.service";

export function registerConnectionHandler(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`Connected: ${socket.id}`);
    registerRoomEvents(socket);
    socket.on("disconnect", (reason) => {
      const session = SessionService.removeSession(socket.id);
      console.log(`Disconnected: ${socket.id} (${reason})`);
      if (session) {
        console.log(
          `${session.participantId} disconnected from ${session.roomId}`,
        );
      }
    });
  });
}

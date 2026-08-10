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
      if (!session) return;
      socket.to(session.roomId).emit("participant-left", {
        participantId: session.participantId,
      });
      console.log(
        `${session.participantId} left socket room ${session.roomId}`,
      );
    });
  });
}

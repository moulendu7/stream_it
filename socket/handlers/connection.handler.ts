import { Server, Socket } from "socket.io";
import { registerRoomEvents } from "../events/room.events";

export function registerConnectionHandler(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`Connected: ${socket.id}`);
    registerRoomEvents(socket);
    socket.on("disconnect", (reason) => {
      console.log(`Disconnected: ${socket.id} (${reason})`);
    });
  });
}

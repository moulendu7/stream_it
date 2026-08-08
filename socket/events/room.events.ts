import { Socket } from "socket.io";
import { SocketJoinRoomSchema } from "@/lib/validations";

export function registerRoomEvents(socket: Socket) {
  socket.on("join-room", async (payload) => {
    const parsed = SocketJoinRoomSchema.safeParse(payload);
    if (!parsed.success) {
      socket.emit("socket-error", {
        event: "join-room",
        error: parsed.error.issues[0].message,
      });
      return;
    }
    const { roomId, participantId } = parsed.data;
    await socket.join(roomId);
    console.log(`${participantId} joined socket room ${roomId}`);
  });
}

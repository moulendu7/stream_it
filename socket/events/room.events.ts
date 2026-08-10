import { Socket } from "socket.io";
import { SocketJoinRoomSchema } from "@/lib/validations";
import { ParticipantService } from "@/services/participant.service";
import { SessionService } from "../services/session.service";

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
    const participant = await ParticipantService.getParticipant(participantId);
    if (!participant) {
      socket.emit("socket-error", {
        event: "join-room",
        error: "Participant not found",
      });
      return;
    }
    if (participant.status !== "joined") {
      socket.emit("socket-error", {
        event: "join-room",
        error: "Participant is not admitted",
      });
      return;
    }
    const belongsToRoom = await ParticipantService.isParticipantInRoom(
      roomId,
      participantId,
    );
    if (!belongsToRoom) {
      socket.emit("socket-error", {
        event: "join-room",
        error: "Participant does not belong to this room",
      });
      return;
    }
    await socket.join(roomId);
    SessionService.addSession(socket, participantId, roomId);
    socket.to(roomId).emit("participant-joined", {
      participant,
    });
    console.log(`${participantId} joined socket room ${roomId}`);
  });
}

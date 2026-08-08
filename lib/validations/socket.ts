import { z } from "zod";

const RoomIdSchema = z.string().trim().length(8, "Invalid room id.");
const ParticipantIdSchema = z.string().uuid("Invalid participant id.");

export const SocketJoinRoomSchema = z.object({
  roomId: RoomIdSchema,
  participantId: ParticipantIdSchema,
});

export type SocketJoinRoomInput = z.infer<typeof SocketJoinRoomSchema>;

import { z } from "zod";

const RoomIdSchema = z.string().trim().length(8, "Invalid room id.");

const ParticipantIdSchema = z.string().uuid("Invalid participant id.");

export const LiveKitTokenSchema = z.object({
  roomId: RoomIdSchema,
  participantId: ParticipantIdSchema,
});

export type LiveKitTokenInput = z.infer<typeof LiveKitTokenSchema>;

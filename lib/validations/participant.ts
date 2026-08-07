import { z } from "zod";

const NameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters.")
  .max(50, "Name cannot exceed 50 characters.");

const RoomIdSchema = z.string().trim().length(8, "Invalid room id.");

const ParticipantIdSchema = z.string().regex(/^p_[A-Z0-9]{8}$/);

export const JoinRoomSchema = z.object({
  roomId: RoomIdSchema,
  name: NameSchema,
});

export const AdmitParticipantSchema = z.object({
  roomId: RoomIdSchema,
  participantId: ParticipantIdSchema,
});

export const RejectParticipantSchema = z.object({
  roomId: RoomIdSchema,
  participantId: ParticipantIdSchema,
});

export const LeaveRoomSchema = z.object({
  roomId: RoomIdSchema,
  participantId: ParticipantIdSchema,
});

export type JoinRoomInput = z.infer<typeof JoinRoomSchema>;

export type AdmitParticipantInput = z.infer<typeof AdmitParticipantSchema>;

export type RejectParticipantInput = z.infer<typeof RejectParticipantSchema>;

export type LeaveRoomInput = z.infer<typeof LeaveRoomSchema>;

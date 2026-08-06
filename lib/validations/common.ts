import { z } from "zod";

export const RoomIdSchema = z.string().trim().length(8);

export const ParticipantIdSchema = z.string().trim().min(1);

export const NameSchema = z.string().trim().min(2).max(50);


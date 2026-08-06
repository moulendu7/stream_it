import { z } from "zod";
import { RoomIdSchema } from "./common";

export const CreateRoomSchema = z.object({
  hostName: z
    .string()
    .trim()
    .min(2, "Host name must be at least 2 characters.")
    .max(50, "Host name cannot exceed 50 characters."),
});
export const EndRoomSchema = z.object({
  roomId: RoomIdSchema,
});

export type EndRoomInput = z.infer<typeof EndRoomSchema>;
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

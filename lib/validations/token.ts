import { z } from "zod";

export const GenerateTokenSchema = z.object({
  roomId: z.string().trim().length(8),
  participantId: z.string().trim().min(1),
});

export type GenerateTokenInput = z.infer<typeof GenerateTokenSchema>;

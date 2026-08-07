import { NextRequest } from "next/server";
import { ParticipantService } from "@/services/participant.service";
import { JoinRoomSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = JoinRoomSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const participant = await ParticipantService.requestJoin(
      parsed.data.roomId,
      parsed.data.name,
    );

    if (!participant.success || !participant.data) {
      return errorResponse(participant.error ?? "Unable to join room", 400);
    }

    return successResponse(participant.data, 200);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

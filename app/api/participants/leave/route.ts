import { NextRequest } from "next/server";
import { ParticipantService } from "@/services/participant.service";
import { LeaveRoomSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = LeaveRoomSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const result = await ParticipantService.leaveRoom(
      parsed.data.roomId,
      parsed.data.participantId,
    );

    if (!result.success) {
      return errorResponse(result.error ?? "Unable to leave room", 400);
    }

    return successResponse(
      {
        message: "Participant left successfully",
      },
      200,
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

import { NextRequest } from "next/server";
import { ParticipantService } from "@/services/participant.service";
import { RejectParticipantSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RejectParticipantSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }
    const result = await ParticipantService.rejectParticipant(
      parsed.data.roomId,
      parsed.data.participantId,
    );
    if (!result.success) {
      return errorResponse(result.error ?? "Unable to reject participant", 400);
    }
    return successResponse(
      {
        message: "Participant rejected successfully",
      },
      200,
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

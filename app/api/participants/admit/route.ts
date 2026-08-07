import { NextRequest } from "next/server";
import { ParticipantService } from "@/services/participant.service";
import { AdmitParticipantSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AdmitParticipantSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }
    const result = await ParticipantService.admitParticipant(
      parsed.data.roomId,
      parsed.data.participantId,
    );

    if (!result.success || !result.data) {
      return errorResponse(result.error ?? "Unable to admit participant", 400);
    }

    return successResponse(result.data, 200);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

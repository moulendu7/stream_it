import { NextRequest } from "next/server";
import { TokenService } from "@/services/token.service";
import { LiveKitTokenSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = LiveKitTokenSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const token = await TokenService.generateToken(
      parsed.data.roomId,
      parsed.data.participantId,
    );

    if (!token.success || !token.data) {
      return errorResponse(token.error ?? "Unable to generate token", 400);
    }

    return successResponse(
      {
        token: token.data,
      },
      200,
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

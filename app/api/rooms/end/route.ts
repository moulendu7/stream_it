import { NextRequest } from "next/server";
import { RoomService } from "@/services/room.service";
import { EndRoomSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = EndRoomSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const result = await RoomService.endRoom(parsed.data.roomId);

    if (!result.success) {
      return errorResponse(result.error ?? "Unable to end room", 404);
    }

    return successResponse({
      message: "Room ended successfully",
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

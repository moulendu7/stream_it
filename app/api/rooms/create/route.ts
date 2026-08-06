import { NextRequest } from "next/server";

import { RoomService } from "@/services/room.service";
import { ParticipantService } from "@/services/participant.service";

import { CreateRoomSchema } from "@/lib/validations";

import { successResponse, errorResponse } from "@/lib/api-response";

import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = CreateRoomSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const room = await RoomService.createRoom();

    if (!room.success || !room.data) {
      return errorResponse(room.error ?? "Unable to create room", 500);
    }

    const participant = await ParticipantService.joinAsHost(
  room.data.id,
  parsed.data.hostName,
);

    if (!participant.success || !participant.data) {
      await RoomService.endRoom(room.data.id);

      return errorResponse(participant.error ?? "Unable to create host", 500);
    }

    return successResponse(
      {
        room: room.data,
        host: participant.data,
      },
      201,
    );
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

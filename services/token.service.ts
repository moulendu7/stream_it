import { createAccessToken } from "@/lib/livekit";
import { RoomService } from "./room.service";
import { ParticipantService } from "./participant.service";
import { ServiceResult } from "@/types/service";

export class TokenService {
  static async generateToken(
    roomId: string,
    participantId: string,
  ): Promise<ServiceResult<string>> {
    const room =
      await RoomService.getRoom(roomId);

    if (!room.success) {
      return {
        success: false,
        error: "Room not found",
      };
    }

    const participant =
      await ParticipantService.findParticipant(
        participantId,
      );

    if (!participant.success || !participant.data) {
      return {
        success: false,
        error: "Participant not found",
      };
    }

    if (participant.data.status !== "joined") {
      return {
        success: false,
        error: "Participant is not admitted",
      };
    }

    const token = createAccessToken(
      participant.data.id,
      participant.data.name,
      roomId,
    );

    return {
      success: true,
      data: await token.toJwt(),
    };
  }
}
import { redis } from "@/lib/redis";
import { redisKeys } from "@/constants/redis";
import { Participant } from "@/types/participant";
import { ServiceResult } from "@/types/service";
import { RoomService } from "./room.service";

export class ParticipantService {
  static async joinAsHost(
    roomId: string,
    participant: Participant,
  ): Promise<ServiceResult<Participant>> {
    const room = await RoomService.getRoom(roomId);

    if (!room.success) {
      return {
        success: false,
        error: "Room not found",
      };
    }

    const host = await redis.get<string>(redisKeys.host(roomId));

    if (host) {
      return {
        success: false,
        error: "Host already exists",
      };
    }

    await redis.hset(redisKeys.participants(roomId), {
      [participant.id]: JSON.stringify(participant),
    });

    await redis.set(redisKeys.host(roomId), participant.id);

    return {
      success: true,
      data: participant,
    };
  }

  static async requestJoin(
    roomId: string,
    participant: Participant,
  ): Promise<ServiceResult<Participant>> {
    const room = await RoomService.getRoom(roomId);

    if (!room.success) {
      return {
        success: false,
        error: "Room not found",
      };
    }

    const count = await redis.hlen(redisKeys.participants(roomId));

    const settings = await redis.get<{
      maxParticipants: number;
    }>(redisKeys.settings(roomId));

    if (count >= settings!.maxParticipants) {
      return {
        success: false,
        error: "Room is full",
      };
    }

    const alreadyJoined = await redis.hexists(
      redisKeys.participants(roomId),
      participant.id,
    );

    if (alreadyJoined) {
      return {
        success: false,
        error: "Already joined",
      };
    }

    const pending = await redis.hexists(
      redisKeys.pending(roomId),
      participant.id,
    );

    if (pending) {
      return {
        success: false,
        error: "Already waiting",
      };
    }

    await redis.hset(redisKeys.pending(roomId), {
      [participant.id]: JSON.stringify(participant),
    });

    return {
      success: true,
      data: participant,
    };
  }
}

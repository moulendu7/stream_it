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

    const hostParticipant: Participant = {
      ...participant,
      isHost: true,
      status: "joined",
      joinedAt: Date.now(),
    };

    await this.saveParticipant(hostParticipant);

    await redis.hset(redisKeys.participants(roomId), {
      [hostParticipant.id]: "1",
    });

    await redis.set(redisKeys.host(roomId), hostParticipant.id);

    return {
      success: true,
      data: hostParticipant,
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

    const settings = await redis.get<{ maxParticipants: number }>(
      redisKeys.settings(roomId),
    );

    if (!settings) {
      return {
        success: false,
        error: "Room settings not found",
      };
    }

    const participantCount = await redis.hlen(redisKeys.participants(roomId));

    if (participantCount >= settings.maxParticipants) {
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

    const alreadyPending = await redis.hexists(
      redisKeys.pending(roomId),
      participant.id,
    );

    if (alreadyPending) {
      return {
        success: false,
        error: "Already waiting",
      };
    }

    const pendingParticipant: Participant = {
      ...participant,
      isHost: false,
      status: "pending",
      joinedAt: Date.now(),
    };

    await this.saveParticipant(pendingParticipant);

    await redis.hset(redisKeys.pending(roomId), {
      [pendingParticipant.id]: "1",
    });

    return {
      success: true,
      data: pendingParticipant,
    };
  }

  static async admitParticipant(
    roomId: string,
    participantId: string,
  ): Promise<ServiceResult<Participant>> {
    const room = await RoomService.getRoom(roomId);

    if (!room.success) {
      return {
        success: false,
        error: "Room not found",
      };
    }

    const pending = await redis.hexists(
      redisKeys.pending(roomId),
      participantId,
    );

    if (!pending) {
      return {
        success: false,
        error: "Participant not waiting",
      };
    }

    const participant = await this.getParticipant(participantId);

    if (!participant) {
      return {
        success: false,
        error: "Participant not found",
      };
    }

    const settings = await redis.get<{ maxParticipants: number }>(
      redisKeys.settings(roomId),
    );

    if (!settings) {
      return {
        success: false,
        error: "Room settings not found",
      };
    }

    const count = await redis.hlen(redisKeys.participants(roomId));

    if (count >= settings.maxParticipants) {
      return {
        success: false,
        error: "Room is full",
      };
    }

    participant.status = "joined";

    await this.saveParticipant(participant);

    await redis.hdel(redisKeys.pending(roomId), participantId);

    await redis.hset(redisKeys.participants(roomId), {
      [participant.id]: "1",
    });

    return {
      success: true,
      data: participant,
    };
  }

  static async rejectParticipant(
    roomId: string,
    participantId: string,
  ): Promise<ServiceResult<null>> {
    const room = await RoomService.getRoom(roomId);

    if (!room.success) {
      return {
        success: false,
        error: "Room not found",
      };
    }

    const exists = await redis.hexists(
      redisKeys.pending(roomId),
      participantId,
    );

    if (!exists) {
      return {
        success: false,
        error: "Participant not waiting",
      };
    }

    await redis.hdel(redisKeys.pending(roomId), participantId);

    await redis.del(redisKeys.participant(participantId));

    return {
      success: true,
      data: null,
    };
  }

  private static async saveParticipant(
    participant: Participant,
  ): Promise<void> {
    await redis.hset(redisKeys.participant(participant.id), {
      id: participant.id,
      name: participant.name,
      isHost: participant.isHost ? "1" : "0",
      joinedAt: participant.joinedAt.toString(),
      status: participant.status,
    });
  }

  private static async getParticipant(
    participantId: string,
  ): Promise<Participant | null> {
    const data = await redis.hgetall(redisKeys.participant(participantId));

    if (Object.keys(data).length === 0) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      isHost: data.isHost === "1",
      joinedAt: Number(data.joinedAt),
      status: data.status as Participant["status"],
    };
  }
}

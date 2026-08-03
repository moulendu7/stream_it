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
    await this.addToParticipants(roomId, hostParticipant.id);

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
    await this.addToPending(roomId, pendingParticipant.id);

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

    const participantCount = await redis.hlen(redisKeys.participants(roomId));

    if (participantCount >= settings.maxParticipants) {
      return {
        success: false,
        error: "Room is full",
      };
    }

    participant.status = "joined";

    await this.saveParticipant(participant);

    await this.removeFromPending(roomId, participantId);

    await this.addToParticipants(roomId, participant.id);

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

    await this.removeFromPending(roomId, participantId);

    await this.deleteParticipant(participantId);

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

    if (!data || Object.keys(data).length === 0) {
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

  private static async deleteParticipant(participantId: string): Promise<void> {
    await redis.del(redisKeys.participant(participantId));
  }

  private static async addToParticipants(
    roomId: string,
    participantId: string,
  ): Promise<void> {
    await redis.hset(redisKeys.participants(roomId), {
      [participantId]: "1",
    });
  }

  private static async removeFromParticipants(
    roomId: string,
    participantId: string,
  ): Promise<void> {
    await redis.hdel(redisKeys.participants(roomId), participantId);
  }

  private static async addToPending(
    roomId: string,
    participantId: string,
  ): Promise<void> {
    await redis.hset(redisKeys.pending(roomId), {
      [participantId]: "1",
    });
  }

  private static async removeFromPending(
    roomId: string,
    participantId: string,
  ): Promise<void> {
    await redis.hdel(redisKeys.pending(roomId), participantId);
  }
  private static mapParticipant(data: Record<string, string>): Participant {
    return {
      id: data.id,
      name: data.name,
      isHost: data.isHost === "1",
      joinedAt: Number(data.joinedAt),
      status: data.status as Participant["status"],
    };
  }
  static async getParticipants(
    roomId: string,
  ): Promise<ServiceResult<Participant[]>> {
    const room = await RoomService.getRoom(roomId);

    if (!room.success) {
      return {
        success: false,
        error: "Room not found",
      };
    }

    const ids = await redis.hkeys(redisKeys.participants(roomId));

    const participants: Participant[] = [];

    for (const id of ids) {
      const participant = await this.getParticipant(id);

      if (participant) {
        participants.push(participant);
      }
    }

    participants.sort((a, b) => a.joinedAt - b.joinedAt);

    return {
      success: true,
      data: participants,
    };
  }

  static async getPendingParticipants(
    roomId: string,
  ): Promise<ServiceResult<Participant[]>> {
    const room = await RoomService.getRoom(roomId);

    if (!room.success) {
      return {
        success: false,
        error: "Room not found",
      };
    }

    const ids = await redis.hkeys(redisKeys.pending(roomId));

    const participants: Participant[] = [];

    for (const id of ids) {
      const participant = await this.getParticipant(id);

      if (participant) {
        participants.push(participant);
      }
    }

    participants.sort((a, b) => a.joinedAt - b.joinedAt);

    return {
      success: true,
      data: participants,
    };
  }

  private static async transferHost(roomId: string): Promise<void> {
    const participants = await this.getParticipants(roomId);

    if (!participants.success || !participants.data) {
      return;
    }

    if (participants.data.length === 0) {
      await RoomService.endRoom(roomId);
      return;
    }

    const nextHost = participants.data[0];

    nextHost.isHost = true;

    await this.saveParticipant(nextHost);

    await redis.set(redisKeys.host(roomId), nextHost.id);
  }

  static async leaveRoom(
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

    const participant = await this.getParticipant(participantId);

    if (!participant) {
      return {
        success: false,
        error: "Participant not found",
      };
    }

    if (participant.status === "pending") {
      await this.removeFromPending(roomId, participantId);

      await this.deleteParticipant(participantId);

      return {
        success: true,
        data: null,
      };
    }

    await this.removeFromParticipants(roomId, participantId);

    await this.deleteParticipant(participantId);

    if (participant.isHost) {
      await this.transferHost(roomId);
    }

    return {
      success: true,
      data: null,
    };
  }
  
}

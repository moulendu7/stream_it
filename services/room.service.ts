import { redis } from "@/lib/redis";
import { env } from "@/lib/env";
import { redisKeys } from "@/constants/redis";
import { Room } from "@/types/room";
import { ServiceResult } from "@/types/service";
import { generateRoomId } from "@/utils/generateRoomId";

export class RoomService {
  static async createRoom(): Promise<ServiceResult<Room>> {
    const id = await generateRoomId();
    const now = Date.now();

    const room: Room = {
      id,
      active: true,
      createdAt: now,
      expiresAt: now + env.roomTTL * 1000,
    };

    const ttl = env.roomTTL;
    await redis.set(redisKeys.room(room.id), room, {
      ex: ttl,
    });

    await redis.set(redisKeys.host(id), "", {
      ex: ttl,
    });
    await redis.set(redisKeys.screenShare(id), "", {
      ex: ttl,
    });

    await redis.set(
      redisKeys.settings(id),
      {
        maxParticipants: env.maxParticipants,
      },
      {
        ex: ttl,
      },
    );

    return {
      success: true,
      data: room,
    };
  }

  static async getRoom(id: string): Promise<ServiceResult<Room>> {
    const room = await redis.get<Room>(redisKeys.room(id));

    if (!room) {
      return {
        success: false,
        error: "Room not found",
      };
    }

    return {
      success: true,
      data: room,
    };
  }

  static async isRoomActive(id: string): Promise<boolean> {
    const room = await redis.get<Room>(redisKeys.room(id));

    if (!room) return false;

    return room.active;
  }

  static async endRoom(id: string): Promise<ServiceResult<null>> {
    const exists = await redis.get(redisKeys.room(id));

    if (!exists) {
      return {
        success: false,
        error: "Room not found",
      };
    }

    await redis.del(redisKeys.room(id));
    await redis.del(redisKeys.host(id));
    await redis.del(redisKeys.participants(id));
    await redis.del(redisKeys.pending(id));
    await redis.del(redisKeys.screenShare(id));
    await redis.del(redisKeys.settings(id));
    await redis.del(redisKeys.chat(id));

    return {
      success: true,
      data: null,
    };
  }
}

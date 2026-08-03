import crypto from "crypto";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/constants/redis";

const ROOM_ID_LENGTH = 8;
const MAX_RETRIES = 5;

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createId() {
    let id = "";

    for (let i = 0; i < ROOM_ID_LENGTH; i++) {
        id += CHARSET[crypto.randomInt(0, CHARSET.length)];
    }

    return id;
}

export async function generateRoomId(): Promise<string> {
    for (let i = 0; i < MAX_RETRIES; i++) {
        const id = createId();

        const exists = await redis.exists(redisKeys.room(id));

        if (!exists) {
            return id;
        }
    }

    throw new Error("Unable to generate unique room id.");
}
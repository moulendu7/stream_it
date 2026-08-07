import { Redis } from "@upstash/redis";
import { env } from "./env";

export const redis = new Redis({
  url: env.redisUrl,
  token: env.redisToken,
});

export async function setTTL(key: string) {
  await redis.expire(key, env.roomTTL);
}
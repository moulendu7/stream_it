const requiredEnv = [
  "LIVEKIT_URL",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const env = {
  livekitUrl: process.env.LIVEKIT_URL!,
  livekitApiKey: process.env.LIVEKIT_API_KEY!,
  livekitApiSecret: process.env.LIVEKIT_API_SECRET!,

  redisUrl: process.env.UPSTASH_REDIS_REST_URL!,
  redisToken: process.env.UPSTASH_REDIS_REST_TOKEN!,

  maxParticipants: Number(process.env.MAX_PARTICIPANTS ?? "5"),

  roomTTL: Number(process.env.ROOM_TTL ?? "21600"),

  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
};
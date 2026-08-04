import { AccessToken } from "livekit-server-sdk";
import { env } from "./env";

export function createAccessToken(
  identity: string,
  name: string,
  roomName: string,
) {
  const token = new AccessToken(env.livekitApiKey, env.livekitApiSecret, {
    identity,
    name,
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return token;
}

export const redisKeys = {
    room: (id: string) => `room:${id}`,

    participants: (id: string) => `room:${id}:participants`,

    pending: (id: string) => `room:${id}:pending`,

    host: (id: string) => `room:${id}:host`,

    screenShare: (id: string) => `room:${id}:screenshare`,

    settings: (id: string) => `room:${id}:settings`,

    chat: (id: string) => `room:${id}:chat`,

    participant: (id: string) => `participant:${id}`,
};
export interface Participant {
    id: string;
    name: string;
    isHost: boolean;
    status: "pending" | "joined";
    joinedAt: number;
    livekitIdentity: string;
}
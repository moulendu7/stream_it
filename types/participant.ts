export interface Participant {
    id: string;
    name: string;
    role: "host" | "participant";
    status: "pending" | "joined";
    joinedAt: number;
    livekitIdentity: string;
}
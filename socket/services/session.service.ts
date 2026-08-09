import { Socket } from "socket.io";
interface SocketSession {
  socketId: string;
  participantId: string;
  roomId: string;
}
export class SessionService {
  private static sessions = new Map<string, SocketSession>();

  static addSession(
    socket: Socket,
    participantId: string,
    roomId: string,
  ): void {
    this.sessions.set(socket.id, {
      socketId: socket.id,
      participantId,
      roomId,
    });
  }
  static getSession(socketId: string): SocketSession | null {
    return this.sessions.get(socketId) ?? null;
  }
  static removeSession(socketId: string): SocketSession | null {
    const session = this.sessions.get(socketId);

    if (!session) {
      return null;
    }
    this.sessions.delete(socketId);
    return session;
  }
  static getParticipantSessions(participantId: string): SocketSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.participantId === participantId,
    );
  }
  static getRoomSessions(roomId: string): SocketSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.roomId === roomId,
    );
  }
}

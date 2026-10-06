import type { CreateSessionInput, Session, SessionRepo } from "./types";

const CLEANUP_INTERVAL_MS = 60 * 1000;
type Disposable = { dispose: () => void };

export function createMemorySessionRepo(): SessionRepo & Disposable {
  const sessions = new Map<string, Session>(); // key: jti

  const timer = setInterval(() => {
    const now = Date.now();
    for (const [id, s] of sessions) {
      if (s.expiresAt.getTime() <= now || s.revokedAt) {
        sessions.delete(id);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  timer.unref?.();

  return {
    async createSession({ id, userId, username, expiresAt }: CreateSessionInput) {
      await Promise.resolve();
      sessions.set(id, { userId, username, expiresAt });
    },
    async findSession(id) {
      await Promise.resolve();
      const session = sessions.get(id);
      if (!session) {
        return undefined;
      }
      if (session.revokedAt !== undefined || session.expiresAt.getTime() <= Date.now()) {
        sessions.delete(id);
        return undefined;
      }
      return session;
    },
    async revokeSession(id) {
      await Promise.resolve();
      const s = sessions.get(id);
      if (!s || s.revokedAt) {
        return false;
      }
      s.revokedAt = new Date();
      return true;
    },
    dispose() {
      clearInterval(timer);
    },
  };
}

import type { LoginResponse, RegisterResponse } from "@monorepo-demo/api";

import { verifyPassword, hashPassword, DUMMY_HASH } from "../utils/bcrypt";
import { signToken } from "../utils/token";
import type { AuthRepo, SessionRepo } from "./types";

export type AuthService = {
  login: (username: string, password: string) => Promise<LoginResponse>;
  register: (username: string, password: string) => Promise<RegisterResponse>;
};

export function createAuthService(repo: AuthRepo, sessionRepo: SessionRepo): AuthService {
  return {
    async login(username: string, password: string): Promise<LoginResponse> {
      const user = await repo.findUserByUsername(username);
      const ok = await verifyPassword(password, user?.password ?? DUMMY_HASH);
      if (!user || !ok) {
        throw new Error("INVALID_CREDENTIALS");
      }

      const { token, jti, expiresAt } = await signToken(String(user.id));
      await sessionRepo.createSession({
        id: jti,
        userId: user.id,
        username: user.username,
        expiresAt,
      });

      return { token };
    },
    async register(username: string, password: string): Promise<RegisterResponse> {
      password = await hashPassword(password);
      let user: { id: number; username: string } | undefined;
      try {
        user = await repo.createUser(username, password);
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "ER_DUP_ENTRY"
        ) {
          throw new Error("USERNAME_ALREADY_EXISTS");
        }
      }
      if (!user) {
        throw new Error("FAILED_TO_CREATE_USER");
      }
      const { token, jti, expiresAt } = await signToken(String(user.id));
      await sessionRepo.createSession({
        id: jti,
        userId: user.id,
        username: user.username,
        expiresAt,
      });
      return { token };
    },
  };
}

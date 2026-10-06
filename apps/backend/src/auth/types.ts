export type AuthUser = {
  id: number;
  username: string;
  password: string;
  created_at: number;
  updated_at: number;
};

export type Session = {
  userId: number;
  username: string;
  expiresAt: Date;
  revokedAt?: Date;
};

export type AuthRepo = {
  findUserByUsername: (username: string) => Promise<AuthUser | undefined>;
  createUser: (username: string, password: string) => Promise<{ id: number; username: string }>;
};

export type CreateSessionInput = {
  id: string;
  username: string;
  userId: number;
  expiresAt: Date;
};

export type SessionRepo = {
  createSession: (session: CreateSessionInput) => Promise<void>;
  findSession: (id: string) => Promise<Session | undefined>;
  revokeSession: (id: string) => Promise<boolean>;
};

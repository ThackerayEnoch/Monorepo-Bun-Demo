import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

import type { Database } from "../database/client";
import { AUTH_SQL } from "./sql";
import type { AuthRepo, AuthUser } from "./types";

type AuthUserRow = RowDataPacket & AuthUser;

export function createAuthRepo(database: Database): AuthRepo {
  return {
    findUserByUsername: async (username: string) => {
      const [rows] = await database.execute<AuthUserRow[]>(AUTH_SQL.findUserByUsername, [username]);
      return rows[0];
    },
    createUser: async (username: string, password: string) => {
      const [result] = await database.execute<ResultSetHeader>(AUTH_SQL.createUser, [
        username,
        password,
      ]);
      return { id: result.insertId, username };
    },
  };
}

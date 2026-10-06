import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createConnection, createPool } from "mysql2/promise";
import type { Pool, RowDataPacket } from "mysql2/promise";

import { env } from "../env";

const connection = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
};

export type Database = Pool;

export function createDatabase(): Database {
  return createPool({ ...connection, dateStrings: true, connectionLimit: 10 });
}

export async function migrate(): Promise<void> {
  const dir = join(import.meta.dir, "../../migrations");
  if (!existsSync(dir)) {
    return;
  }

  const conn = await createConnection({ ...connection, multipleStatements: true });
  try {
    await conn.query("SELECT GET_LOCK('demo_migrations', 30)");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name       VARCHAR(255) NOT NULL PRIMARY KEY,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const [rows] = await conn.query<Array<RowDataPacket & { name: string }>>(
      "SELECT name FROM _migrations",
    );
    const applied = new Set(rows.map((row) => row.name));

    for (const file of readdirSync(dir)
      .filter((entry) => entry.endsWith(".sql"))
      .toSorted()) {
      if (applied.has(file)) {
        continue;
      }
      // Migrations must remain sequential because each file can depend on the previous one.
      // oxlint-disable-next-line no-await-in-loop
      await conn.query(readFileSync(join(dir, file), "utf8"));
      // oxlint-disable-next-line no-await-in-loop
      await conn.query("INSERT INTO _migrations (name) VALUES (?)", [file]);
    }
  } finally {
    await conn.query("SELECT RELEASE_LOCK('demo_migrations')");
    await conn.end();
  }
}

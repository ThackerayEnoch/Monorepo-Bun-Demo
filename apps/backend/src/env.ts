import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DB_HOST: z.string().min(1).default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET 至少需要 32 个字符"),
});

export const env = schema.parse(process.env);

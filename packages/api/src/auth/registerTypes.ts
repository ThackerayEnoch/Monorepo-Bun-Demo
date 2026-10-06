import { z } from "zod";

import { ResultSchema } from "../common/result";
/** { username: string; password: string; } */
export const registerRequestSchema = z.object({
  user: z
    .string()
    .trim()
    .min(6, "用户名必须在6-16个字符之间")
    .max(16, "用户名必须在6-16个字符之间"),
  password: z
    .string()
    .trim()
    .min(8, "密码必须在8-32个字符之间")
    .max(32, "密码必须在8-32个字符之间"),
});
/** { token: string; } */
export const registerResponseSchema = z.object({
  token: z.string(),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;

export const registerResultSchema = ResultSchema(registerResponseSchema);
export type RegisterResult = z.infer<typeof registerResultSchema>;

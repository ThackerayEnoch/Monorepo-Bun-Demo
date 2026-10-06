import { z } from "zod";

import { ResultSchema } from "../common/result";
/** { username: string; password: string; } */
export const loginRequestSchema = z.object({
  username: z
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
export const loginResponseSchema = z.object({
  token: z.string(),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const loginResultSchema = ResultSchema(loginResponseSchema);
export type LoginResult = z.infer<typeof loginResultSchema>;

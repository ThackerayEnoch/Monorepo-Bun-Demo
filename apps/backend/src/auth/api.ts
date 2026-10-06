import { zValidator } from "@hono/zod-validator";
import { loginRequestSchema, registerRequestSchema } from "@monorepo-demo/api";
import { Hono } from "hono";

import type { AuthService } from "./service";

// Auth routes are kept independent so authentication can add its own session strategy.
// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function createAuthApi(service: AuthService) {
  return new Hono()
    .post(
      "/api/login",
      zValidator("json", loginRequestSchema, (result, c) => {
        return result.success
          ? undefined
          : c.json(
              {
                status: "error",
                error: {
                  code: "INVALID_REQUEST",
                  message: result.error.message,
                },
                timestamp: Date.now(),
              },
              400,
            );
      }),
      async (c) => {
        const { username, password } = c.req.valid("json");

        try {
          const result = await service.login(username, password);

          return c.json({ status: "ok", data: result, timestamp: Date.now() }, 200);
        } catch (error) {
          if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
            return c.json(
              {
                status: "error",
                error: { code: "INVALID_CREDENTIALS", message: "用户名或密码错误" },
                timestamp: Date.now(),
              },
              400,
            );
          }
          throw error; // 其他未知错误交给全局处理
        }
      },
    )
    .post(
      "/api/register",
      zValidator("json", registerRequestSchema, (result, c) => {
        return result.success
          ? undefined
          : c.json(
              {
                status: "error",
                error: {
                  code: "INVALID_REQUEST",
                  message: result.error.message,
                },
                timestamp: Date.now(),
              },
              400,
            );
      }),
      async (c) => {
        const { user: username, password } = c.req.valid("json");

        try {
          const result = await service.register(username, password);

          return c.json({ status: "ok", data: result, timestamp: Date.now() }, 200);
        } catch (error) {
          if (error instanceof Error && error.message === "USER_EXISTS") {
            return c.json(
              {
                status: "error",
                error: { code: "USER_EXISTS", message: "用户已存在" },
                timestamp: Date.now(),
              },
              409,
            );
          }
          throw error; // 其他未知错误交给全局处理
        }
      },
    );
}

export type AuthApiType = ReturnType<typeof createAuthApi>;

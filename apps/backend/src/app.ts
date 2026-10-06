import { Hono } from "hono";
import { cors } from "hono/cors";

//--------------------------------------------
// 引入不同文件夹的controller与参数、返回值的types
import { createAuthApi } from "./auth/api";
import type { AuthService } from "./auth/service";
import { createHomeApi } from "./home/api";
import type { TodoRepo } from "./home/types";
//--------------------------------------------
// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function createApp(todoRepo: TodoRepo, authService: AuthService) {
  return (
    new Hono()
      .use("/api/*", cors())
      // 注册不同文件夹的controller，传入type
      .route("/", createHomeApi(todoRepo))
      .route("/", createAuthApi(authService))
  );
}

export type AppType = ReturnType<typeof createApp>;

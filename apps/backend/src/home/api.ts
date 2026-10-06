import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import type { TodoRepo } from "./types";

const createSchema = z.object({ title: z.string().trim().min(1).max(200) });
const patchSchema = z.object({ done: z.boolean() });
const idSchema = z.object({ id: z.coerce.number().int().positive() });

// 返回类型是前端 RPC 的类型来源，不能手动标注为 Hono。
// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function createHomeApi(repo: TodoRepo) {
  return new Hono()
    .get("/api/todos", async (c) => c.json(await repo.list()))
    .post("/api/todos", zValidator("json", createSchema), async (c) => {
      const { title } = c.req.valid("json");
      return c.json(await repo.create(title), 201);
    })
    .patch(
      "/api/todos/:id",
      zValidator("param", idSchema),
      zValidator("json", patchSchema),
      async (c) => {
        const { id } = c.req.valid("param");
        const { done } = c.req.valid("json");
        const todo = await repo.setDone(id, done);
        return todo ? c.json(todo) : c.json({ error: "not found" }, 404);
      },
    )
    .delete("/api/todos/:id", zValidator("param", idSchema), async (c) => {
      const { id } = c.req.valid("param");
      return (await repo.remove(id)) ? c.body(null, 204) : c.json({ error: "not found" }, 404);
    });
}

export type HomeApiType = ReturnType<typeof createHomeApi>;

import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()
  .use('/api/*', cors())
  .get('/api/hello', (c) => c.json({ message: 'hello from bun' }))
  .post('/api/echo', async (c) => c.json(await c.req.json()))

export type AppType = typeof app // 给前端做类型推导

const server = {
  port: 3001,
  fetch(): Response {
    return Response.json({ ok: true });
  },
};

export default server;
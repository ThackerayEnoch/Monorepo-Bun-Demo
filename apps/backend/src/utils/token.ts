import { sign, verify } from "hono/jwt";

import { env } from "../env";

const SECRET = env.JWT_SECRET;
const ALG = "HS256";
export const TOKEN_TTL_SEC = 60 * 60 * 2; // 2 小时

export type TokenPayload = {
  sub: string; // 用户 id
  jti: string; // session UUID
  iat: number;
  exp: number;
  [key: string]: unknown;
};

export async function signToken(
  userId: string,
): Promise<{ token: string; jti: string; expiresAt: Date }> {
  const now = Math.floor(Date.now() / 1000);
  const jti = crypto.randomUUID(); // Node 19+/Bun/浏览器均内置,无需 uuid 包
  const exp = now + TOKEN_TTL_SEC;

  const token = await sign({ sub: userId, jti, iat: now, exp }, SECRET, ALG);
  return { token, jti, expiresAt: new Date(exp * 1000) };
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  // 签名错误或过期会抛异常,exp 由 hono/jwt 自动校验
  const payload = await verify(token, SECRET, ALG);
  if (
    typeof payload.sub !== "string" ||
    typeof payload.jti !== "string" ||
    typeof payload.iat !== "number" ||
    typeof payload.exp !== "number"
  ) {
    throw new TypeError("INVALID_TOKEN_PAYLOAD");
  }

  return {
    ...payload,
    sub: payload.sub,
    jti: payload.jti,
    iat: payload.iat,
    exp: payload.exp,
  };
}

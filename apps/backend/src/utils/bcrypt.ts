import bcrypt from "bcrypt";

// cost 越大越慢也越安全,12 约 200~300ms,是常见的默认值
const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// 用户不存在时拿它做一次假比较,抹平响应时间差异
export const DUMMY_HASH = bcrypt.hashSync("dummy-password", SALT_ROUNDS);

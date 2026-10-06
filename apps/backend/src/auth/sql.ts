export const AUTH_SQL = {
  findUserByUsername:
    "SELECT id, username, password, created_at, updated_at FROM user WHERE username = ?",
  createUser:
    "INSERT INTO user (username, password, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
} as const;

// auth/errors.ts
export class AuthError extends Error {
  constructor(
    public readonly code: "INVALID_CREDENTIALS" | "INVALID_TOKEN",
    public readonly status: 401 | 403 = 401,
  ) {
    super(code);
    this.name = "AuthError";
  }
}

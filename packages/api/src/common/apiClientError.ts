import type { ApiError } from "./apiError";

export class ApiClientError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly data?: unknown;

  constructor(error: ApiError, status?: number, data?: unknown) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.status = status;
    this.data = data;
  }
}

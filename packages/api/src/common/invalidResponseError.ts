export class InvalidResponseError extends Error {
  override readonly name = "InvalidResponseError";
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, cause?: unknown) {
    super("后端返回数据格式非法", { cause });
    this.status = status;
    this.body = body;
  }
}

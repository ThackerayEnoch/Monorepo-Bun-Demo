import { create } from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { z } from "zod";

import { ApiClientError } from "./apiClientError";
import { InvalidResponseError } from "./invalidResponseError";
import { ResultSchema } from "./result";
import type { Result } from "./result";

export type ApiClientOptions = AxiosRequestConfig & {
  getToken?: () => string | undefined | Promise<string | undefined>;
  onUnauthorized?: (error: ApiClientError) => void;
};

export type RequestConfig = Omit<AxiosRequestConfig, "data">;

function serializeValue(value: unknown): string {
  return typeof value === "object" && value !== null
    ? (JSON.stringify(value) ?? "")
    : String(value);
}

function serializeParams(params: Record<string, unknown>): string {
  const searchParams: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(serializeValue(item))}`);
      }
      continue;
    }

    searchParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(serializeValue(value))}`);
  }

  return searchParams.join("&");
}

export class ApiClient {
  readonly service: AxiosInstance;
  private readonly getToken?: ApiClientOptions["getToken"];
  private readonly onUnauthorized?: ApiClientOptions["onUnauthorized"];

  constructor(options: ApiClientOptions = {}) {
    const { getToken, onUnauthorized, ...axiosConfig } = options;
    this.getToken = getToken;
    this.onUnauthorized = onUnauthorized;
    this.service = create({
      ...axiosConfig,
      paramsSerializer: { serialize: serializeParams },
    });

    this.service.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      const token = await this.getToken?.();
      if (token !== undefined && token !== "") {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      return config;
    });

    this.service.interceptors.response.use(
      (response: AxiosResponse<Result<unknown>>) => {
        response.data = this.handleResponse(response);
        return response;
      },
      (error: AxiosError<Result<unknown>>) => this.handleError(error),
    );
  }

  async request<T>(config: AxiosRequestConfig): Promise<Result<T>> {
    const response = await this.service.request<Result<T>>(config);
    return response.data;
  }

  async get<T>(url: string, config?: RequestConfig): Promise<Result<T>> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<Result<T>> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<Result<T>> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<Result<T>> {
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<Result<T>> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }
  /**
   * 解析后端返回，校验格式，区分成功和失败的请求。
   *
   * 成功返回 `{ status: "ok", data: T, timestamp: number }`， 失败返回 `{ status: "error", error: K,
   * timestamp: number }`。
   *
   * 兼容以下两种业务写法：
   *
   * 1. HTTP status 一直是 200，通过 success 字段判断请求是否成功
   * 2. 2xx 是请求成功，非 2xx 是请求失败
   */
  private handleResponse(response: AxiosResponse<unknown>): Result<unknown> {
    const parsed = ResultSchema(z.unknown()).safeParse(response.data);
    if (!parsed.success) {
      throw new InvalidResponseError(response.status, response.data, parsed.error);
    }

    if (parsed.data.status === "ok") {
      return parsed.data;
    }

    const error = new ApiClientError(parsed.data.error, response.status, response.data);
    this.notifyUnauthorized(response.status, error);
    throw error;
  }

  private handleError(error: AxiosError<Result<unknown>>): never {
    if (!error.response) {
      throw error;
    }

    const parsed = ResultSchema(z.unknown()).safeParse(error.response.data);
    if (!parsed.success) {
      throw new InvalidResponseError(error.response.status, error.response.data, parsed.error);
    }

    if (parsed.data.status === "ok") {
      throw new InvalidResponseError(error.response.status, error.response.data);
    }

    const apiError = new ApiClientError(
      parsed.data.error,
      error.response.status,
      error.response.data,
    );
    this.notifyUnauthorized(error.response.status, apiError);
    throw apiError;
  }

  private notifyUnauthorized(status: number, error: ApiClientError): void {
    if (status === 401) {
      this.onUnauthorized?.(error);
    }
  }
}

export function createApiClient(options?: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}

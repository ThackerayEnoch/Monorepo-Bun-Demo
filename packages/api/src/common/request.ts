import { create } from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { ApiClientError } from "./apiClientError";
import type { ApiError } from "./apiError";
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

function getApiError(data: unknown): ApiError {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    data.error !== null &&
    typeof data.error === "object" &&
    "code" in data.error &&
    "message" in data.error &&
    typeof data.error.code === "string" &&
    typeof data.error.message === "string"
  ) {
    return {
      code: data.error.code,
      message: data.error.message,
    };
  }

  return {
    code: "HTTP_ERROR",
    message: "请求失败",
  };
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

  private handleResponse(response: AxiosResponse<Result<unknown>>): Result<unknown> {
    const result = response.data;
    if (result?.status === "ok") {
      return result;
    }

    const error = new ApiClientError(getApiError(result), response.status, result);
    this.notifyUnauthorized(response.status, error);
    throw error;
  }

  private handleError(error: AxiosError<Result<unknown>>): never {
    if (!error.response) {
      throw error;
    }

    const apiError = new ApiClientError(
      getApiError(error.response.data),
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

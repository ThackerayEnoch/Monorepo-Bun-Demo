import type { LoginRequest, LoginResponse } from "../auth/loginTypes";
import type { Result } from "../common/result";
import type { RegisterRequest, RegisterResponse, ApiClient } from "../index";

export type AuthApi = {
  login: (params: LoginRequest) => Promise<Result<LoginResponse>>;
  register: (params: RegisterRequest) => Promise<Result<RegisterResponse>>;
};
export function createAuthApi(client: ApiClient): AuthApi {
  return {
    async login(params: LoginRequest): Promise<Result<LoginResponse>> {
      return client.post<LoginResponse>("/api/login", params);
    },

    async register(params: RegisterRequest): Promise<Result<RegisterResponse>> {
      return client.post<RegisterResponse>("/api/register", params);
    },
  };
}

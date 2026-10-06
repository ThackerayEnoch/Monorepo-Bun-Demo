import type { LoginRequest, LoginResponse } from "../auth/loginTypes";
import type { RegisterRequest, RegisterResponse } from "../index";
import type { ApiClient } from "../index";

export function createAuthApi(client: ApiClient) {
  return {
    login(params: LoginRequest) {
      return client.post<LoginResponse>("/api/login", params);
    },

    register(params: RegisterRequest) {
      return client.post<RegisterResponse>("/api/register", params);
    },
  };
}

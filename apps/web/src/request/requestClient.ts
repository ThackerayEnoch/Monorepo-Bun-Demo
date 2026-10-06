import { createApiClient } from "@monorepo-demo/api";
import type { ApiClientError } from "@monorepo-demo/api";
import { z } from "zod";

const envSchema = z.object({
  VITE_DEV_API_URL: z.string(),
});
const parsedEnv = envSchema.parse(import.meta.env);

const client = createApiClient({
  baseURL: parsedEnv.VITE_DEV_API_URL,
  onUnauthorized: webOnUnauthorized,
});
type Navigate = (to: string) => void;

let navigate: Navigate = (to): void => {
  globalThis.location.href = to;
};

export function setNavigate(fn: Navigate): void {
  navigate = fn;
}
function webOnUnauthorized(_error: ApiClientError) {
  // Web 端的登录失效处理
  navigate("/login");
}

export { client as apiClient };

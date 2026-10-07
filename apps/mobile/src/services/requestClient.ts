import { createApiClient } from "@monorepo-demo/api";
import type { ApiClientError } from "@monorepo-demo/api";
import { router } from "expo-router";

import { env } from "@/env";

const client = createApiClient({
  baseURL: env.EXPO_PUBLIC_API_URL,
  getToken: getToken,
  onUnauthorized: webOnUnauthorized,
});

function webOnUnauthorized(_error: ApiClientError) {
  // Web 端的登录失效处理
  router.replace("/login");
}
function getToken() {
  return "Token: wfoiehgwoihboicxhgiuoqw";
}
export { client as apiClient };

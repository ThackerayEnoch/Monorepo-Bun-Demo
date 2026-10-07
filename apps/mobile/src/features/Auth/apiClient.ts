import { createAuthApi } from "@monorepo-demo/api";

import { apiClient } from "@/services/requestClient";

export const authApi = createAuthApi(apiClient);

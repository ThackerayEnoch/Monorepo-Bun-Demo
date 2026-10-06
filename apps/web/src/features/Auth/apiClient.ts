import { createAuthApi } from "@monorepo-demo/api";

import { apiClient } from "../../request/requestClient";

export const authApi = createAuthApi(apiClient);

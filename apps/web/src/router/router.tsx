import { createBrowserRouter } from "react-router";

import { setNavigate } from "../request/requestClient";
import { routes } from "./routes";

export const router = createBrowserRouter(routes);
setNavigate((to) => void router.navigate(to));

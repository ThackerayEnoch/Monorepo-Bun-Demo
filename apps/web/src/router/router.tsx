import { createBrowserRouter } from "react-router";

import LogIn from "../features/Auth/LogIn";
import { Home } from "../pages/home";
import { setNavigate } from "../request/requestClient";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <LogIn />,
  },
];

export const router = createBrowserRouter(routes);
setNavigate((to) => void router.navigate(to));

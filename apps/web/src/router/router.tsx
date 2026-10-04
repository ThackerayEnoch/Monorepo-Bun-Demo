import { createBrowserRouter } from "react-router";
import { Home } from "@web/pages/home";
import { SignIn } from "@web/pages/signIn";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
];

export const router = createBrowserRouter(routes);

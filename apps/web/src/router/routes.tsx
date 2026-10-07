import type { RouteObject } from "react-router";

export const routes: RouteObject[] = [
  {
    path: "/",
    lazy: async () => {
      const { default: Home } = await import("../pages/home");
      return { Component: Home };
    },
  },
  {
    path: "/login",
    lazy: async () => {
      const { default: LogIn } = await import("../features/Auth/pages/LogIn");
      return { Component: LogIn };
    },
  },
  {
    path: "/signup",
    lazy: async () => {
      const { default: SignUp } = await import("../features/Auth/SignUp");
      return { Component: SignUp };
    },
  },
];

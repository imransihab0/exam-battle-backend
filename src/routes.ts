import { Router } from "express";
import { userRoutes } from "./app/modules/users/user.route";
import { authRoutes } from "./app/modules/auth/auth.routes";

export const routes = Router();

const allRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
];

allRoutes.forEach(({ path, route }) => routes.use(path, route));

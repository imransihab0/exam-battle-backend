import { Router } from "express";
import { userRoutes } from "./app/modules/users/user.route";
import { authRoutes } from "./app/modules/auth/auth.routes";
import { questionPaperRoutes } from "./app/modules/questionPaper/questionPaper.route";

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
  {
    path: "/question-paper",
    route: questionPaperRoutes,
  },
];

allRoutes.forEach(({ path, route }) => routes.use(path, route));

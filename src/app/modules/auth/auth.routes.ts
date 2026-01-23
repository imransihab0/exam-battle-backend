import { Router } from "express";
import { authController } from "./auth.controller";
import { Roles } from "../users/user.interface";
import { roleBasedProtection } from "../../middleware/roleBasedProtection";

export const authRoutes = Router();

authRoutes.post("/login", authController.userLogin);

authRoutes.get(
  "/getMe",
  roleBasedProtection(...Object.values(Roles)),
  authController.getMe,
);

authRoutes.post("/refresh-token", authController.getNewAccessToken);

authRoutes.get("/logout", authController.userLogOut);

authRoutes.post(
  "/change-password",
  roleBasedProtection(...Object.values(Roles)),
  authController.changePassword,
);

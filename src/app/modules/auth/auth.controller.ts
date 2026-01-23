import { Request, Response } from "express";
import { authService } from "./auth.service";
import { JwtPayload } from "jsonwebtoken";
import { responseManager } from "../../utils/responseManager";
import { logger } from "../../utils/logger";
import { cookiesManagement } from "../../utils/cookiesManagement";

const userLogin = async (req: Request, res: Response) => {
  try {
    const loggedInUser = await authService.userLoginService(req.body);

    cookiesManagement.setCookie(
      res,
      loggedInUser.accessToken,
      loggedInUser.refreshToken,
    );

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "log in successful",
      data: loggedInUser,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error);
    responseManager.error(res, error as Error, 400);
  }
};

const getMe = async (req: Request, res: Response) => {
  try {
    const payload = req.user;
    const user = await authService.getMeService(payload as JwtPayload);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "user auth info",
      data: user,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error);
    responseManager.error(res, error as Error, 400);
  }
};

const getNewAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const newAccessToken = await authService.getNewAccessTokenService(
      refreshToken as string,
    );
    cookiesManagement.setCookie(res, (newAccessToken as any).newAccessToken);

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "new accees token created",
      data: newAccessToken,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error);
    responseManager.error(res, error as Error, 400);
  }
};

const userLogOut = async (req: Request, res: Response) => {
  try {
    cookiesManagement.clearCookie(res);

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "user log out",
      data: {},
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error);
    responseManager.error(res, error as Error, 400);
  }
};

const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const payload = req.user;

    await authService.changePassword(
      oldPassword,
      newPassword,
      payload as JwtPayload,
    );

    responseManager.success(res, {
      statusCode: 201,
      success: true,
      message: "password updated",
      data: {},
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error);
    responseManager.error(res, error as Error, 400);
  }
};

export const authController = {
  userLogin,
  getMe,
  getNewAccessToken,
  userLogOut,
  changePassword,
};

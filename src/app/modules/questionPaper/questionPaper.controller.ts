import { Request, Response } from "express";
import { responseManager } from "../../utils/responseManager";
import { logger } from "../../utils/logger";
import { questionPaperService } from "./questionPaper.service";

const getAllQuestionPapers = async (req: Request, res: Response) => {
  try {
    const result = await questionPaperService.getAllQuestionPapers();
    console.log(result);
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Question papers fetched successfully",
      data: result,
    });
  } catch (error: any) {
    logger.error(error);
    responseManager.error(res, error as Error, 400);
  }
};

export const questionPaperController = {
  getAllQuestionPapers,
};

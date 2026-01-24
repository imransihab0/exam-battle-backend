import { Router } from "express";
import { questionPaperController } from "./questionPaper.controller";

const router = Router();

router.get("/", questionPaperController.getAllQuestionPapers);

export const questionPaperRoutes = router;

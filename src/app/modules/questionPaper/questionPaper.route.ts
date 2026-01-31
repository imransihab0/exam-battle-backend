import { Router } from "express";
import { questionPaperController } from "./questionPaper.controller";

const router = Router();

router.get("/", questionPaperController.getAllQuestionPapers);
router.get("/:id", questionPaperController.getSingleQuestionPaper);

export const questionPaperRoutes = router;

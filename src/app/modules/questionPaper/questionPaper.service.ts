import { QuestionPaper } from "./questionPaper.model";

const getAllQuestionPapers = async () => {
  return await QuestionPaper.find().populate("questionIds");
};

export const questionPaperService = {
  getAllQuestionPapers,
};

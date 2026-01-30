import { QuestionPaper } from "./questionPaper.model";

const getAllQuestionPapers = async () => {
  return await QuestionPaper.find().populate("questionIds");
};

const getQuestionPaperById = async (id: string) => {
  return await QuestionPaper.findById(id).populate("questionIds");
};

export const questionPaperService = {
  getAllQuestionPapers,
  getQuestionPaperById,
};

import mongoose from "mongoose";
import { Question } from "../question/question.model";
import { QuestionPaper } from "./questionPaper.model";

const getAllQuestionPapers = async () => {
  return await QuestionPaper.find().populate("questionIds");
};

const getSingleQuestionPaper = async (id: string) => {
  console.log(">>>> SERVICE: getSingleQuestionPaper called with id:", id);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.log(">>>> SERVICE: Invalid ID received:", id);
    return [];
  }

  const res = await Question.find({ questionPaperId: id });
  console.log(">>>> SERVICE: Found questions:", res.length);
  return res;
};

export const questionPaperService = {
  getAllQuestionPapers,
  getSingleQuestionPaper,
};

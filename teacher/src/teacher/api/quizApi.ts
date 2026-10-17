import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type BackendQuizOption = {
  id: string;
  optionText: string;
  correct: boolean;
  optionOrder: number;
};

export type BackendQuizQuestion = {
  id: string;
  questionText: string;
  questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER";
  marks: number;
  questionOrder: number;
  options: BackendQuizOption[];
};

export type BackendQuiz = {
  id: string;
  courseId: string;
  teacherId: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  passMark: number;
  startTime?: string;
  endTime?: string;
  maxAttempts: number;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  creationMethod?: "MANUAL" | "AI_GENERATED";
  showResultImmediately?: boolean;
  questions: BackendQuizQuestion[];
};

export async function getTeacherQuizzes(signal?: AbortSignal): Promise<BackendQuiz[]> {
  const response = await apiRequest<ApiResponse<BackendQuiz[]>>("/api/quizzes/teacher", {
    signal,
  });

  return response.data ?? [];
}

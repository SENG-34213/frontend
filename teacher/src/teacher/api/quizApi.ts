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

export type QuizDraft = {
  courseId: string;
  title: string;
  description?: string;
  durationMinutes: number;
  passMark: number;
  startTime?: string;
  endTime?: string;
  maxAttempts: number;
  showResultImmediately?: boolean;
  creationMethod?: "MANUAL" | "AI_GENERATED";
};

export type QuizQuestionDraft = {
  questionText: string;
  questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER";
  marks: number;
  questionOrder: number;
  options: Array<{ optionText: string; correct: boolean; optionOrder: number }>;
};

export type QuizAnalytics = {
  date: string;
  resultType: string;
  quizzes: Array<{
    quizId: string;
    courseId: string;
    quizTitle: string;
    startTime?: string;
    totalMarks: number;
    passMark: number;
    submittedAttempts: number;
    participants: number;
    averagePercentage?: number;
    highestPercentage?: number;
    lowestPercentage?: number;
    passedAttempts: number;
    belowPassThresholdAttempts: number;
  }>;
};

export async function getTeacherQuizzes(signal?: AbortSignal): Promise<BackendQuiz[]> {
  const response = await apiRequest<ApiResponse<BackendQuiz[]>>("/api/quizzes/teacher", {
    signal,
  });

  return response.data ?? [];
}

export async function createQuiz(draft: QuizDraft) {
  const response = await apiRequest<ApiResponse<BackendQuiz>>("/api/quizzes", {
    method: "POST",
    body: draft,
  });
  return response.data;
}

export async function updateQuiz(
  quizId: string,
  draft: Omit<QuizDraft, "courseId" | "creationMethod">,
) {
  const response = await apiRequest<ApiResponse<BackendQuiz>>(`/api/quizzes/${quizId}`, {
    method: "PUT",
    body: draft,
  });
  return response.data;
}

export async function deleteQuiz(quizId: string) {
  await apiRequest<ApiResponse<unknown>>(`/api/quizzes/${quizId}`, { method: "DELETE" });
}

export async function publishQuiz(quizId: string) {
  const response = await apiRequest<ApiResponse<BackendQuiz>>(`/api/quizzes/${quizId}/publish`, {
    method: "POST",
  });
  return response.data;
}

export async function createQuizQuestion(quizId: string, draft: QuizQuestionDraft) {
  const response = await apiRequest<ApiResponse<BackendQuizQuestion>>(
    `/api/quizzes/${quizId}/questions`,
    { method: "POST", body: draft },
  );
  return response.data;
}

export async function updateQuizQuestion(
  quizId: string,
  questionId: string,
  draft: QuizQuestionDraft,
) {
  const response = await apiRequest<ApiResponse<BackendQuizQuestion>>(
    `/api/quizzes/${quizId}/questions/${questionId}`,
    { method: "PUT", body: draft },
  );
  return response.data;
}

export async function deleteQuizQuestion(quizId: string, questionId: string) {
  await apiRequest<ApiResponse<unknown>>(`/api/quizzes/${quizId}/questions/${questionId}`, {
    method: "DELETE",
  });
}

export async function getTodayQuizAnalytics(signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<QuizAnalytics>>(
    "/api/internal/quizzes/analytics/today/performance",
    { signal },
  );
  return response.data;
}

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
  explanation?: string;
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
  explanation?: string;
  questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER";
  marks: number;
  questionOrder: number;
  options: Array<{ optionText: string; correct: boolean; optionOrder: number }>;
};

export type AiQuizDraft = {
  courseId: string;
  questionCount: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER";
  creationMethod: "AI_GENERATED";
  questions: Array<QuizQuestionDraft & { explanation?: string }>;
  provider?: string;
  model?: string;
};

export async function generateAiQuizDraft(formData: FormData): Promise<AiQuizDraft> {
  const response = await apiRequest<ApiResponse<AiQuizDraft>>(
    "/api/assignments/quizzes/ai/generate",
    {
      method: "POST",
      body: formData,
    },
  );
  return response.data as AiQuizDraft;
}

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

const finiteNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

function normalizeQuizAnalytics(value: unknown): QuizAnalytics | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  if (typeof source.date !== "string" || typeof source.resultType !== "string") return null;
  if (!Array.isArray(source.quizzes))
    return { date: source.date, resultType: source.resultType, quizzes: [] };

  const quizzes = source.quizzes.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const quiz = entry as Record<string, unknown>;
    const quizId = typeof quiz.quizId === "string" ? quiz.quizId : undefined;
    const courseId = typeof quiz.courseId === "string" ? quiz.courseId : undefined;
    const quizTitle = typeof quiz.quizTitle === "string" ? quiz.quizTitle : undefined;
    const totalMarks = finiteNumber(quiz.totalMarks);
    const passMark = finiteNumber(quiz.passMark);
    const submittedAttempts = finiteNumber(quiz.submittedAttempts);
    const participants = finiteNumber(quiz.participants);
    const passedAttempts = finiteNumber(quiz.passedAttempts);
    const belowPassThresholdAttempts = finiteNumber(quiz.belowPassThresholdAttempts);
    if (
      !quizId ||
      !courseId ||
      !quizTitle ||
      [
        totalMarks,
        passMark,
        submittedAttempts,
        participants,
        passedAttempts,
        belowPassThresholdAttempts,
      ].some((metric) => metric === undefined)
    ) {
      return [];
    }
    return [
      {
        quizId,
        courseId,
        quizTitle,
        startTime: typeof quiz.startTime === "string" ? quiz.startTime : undefined,
        totalMarks: totalMarks as number,
        passMark: passMark as number,
        submittedAttempts: submittedAttempts as number,
        participants: participants as number,
        averagePercentage: finiteNumber(quiz.averagePercentage),
        highestPercentage: finiteNumber(quiz.highestPercentage),
        lowestPercentage: finiteNumber(quiz.lowestPercentage),
        passedAttempts: passedAttempts as number,
        belowPassThresholdAttempts: belowPassThresholdAttempts as number,
      },
    ];
  });

  return { date: source.date, resultType: source.resultType, quizzes };
}

export type TeacherQuizResults = {
  quizId: string;
  totalMarks?: number | string | null;
  results: Array<{
    studentId: string;
    studentName?: string | null;
    marksObtained?: number | string | null;
    percentage?: number | string | null;
    passed: boolean;
    submittedAt?: string | null;
    answers?: Array<{
      questionId: string;
      questionText: string;
      selectedAnswer: string;
      correctAnswer: string;
      correct: boolean;
      awardedMarks?: number | string | null;
    }>;
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
  return response.data as BackendQuiz;
}

export async function getQuiz(quizId: string) {
  const response = await apiRequest<ApiResponse<BackendQuiz>>(
    `/api/quizzes/${encodeURIComponent(quizId)}`,
  );
  return response.data as BackendQuiz;
}

export async function updateQuiz(
  quizId: string,
  draft: Omit<QuizDraft, "courseId" | "creationMethod">,
) {
  const response = await apiRequest<ApiResponse<BackendQuiz>>(
    `/api/quizzes/${encodeURIComponent(quizId)}`,
    {
      method: "PUT",
      body: draft,
    },
  );
  return response.data as BackendQuiz;
}

export async function deleteQuiz(quizId: string) {
  await apiRequest<ApiResponse<unknown>>(`/api/quizzes/${encodeURIComponent(quizId)}`, {
    method: "DELETE",
  });
}

export async function publishQuiz(quizId: string) {
  const response = await apiRequest<ApiResponse<BackendQuiz>>(
    `/api/quizzes/${encodeURIComponent(quizId)}/publish`,
    {
      method: "POST",
    },
  );
  return response.data as BackendQuiz;
}

export async function createQuizQuestion(quizId: string, draft: QuizQuestionDraft) {
  const response = await apiRequest<ApiResponse<BackendQuizQuestion>>(
    `/api/quizzes/${encodeURIComponent(quizId)}/questions`,
    { method: "POST", body: draft },
  );
  return response.data as BackendQuizQuestion;
}

export async function updateQuizQuestion(
  quizId: string,
  questionId: string,
  draft: QuizQuestionDraft,
) {
  const response = await apiRequest<ApiResponse<BackendQuizQuestion>>(
    `/api/quizzes/${encodeURIComponent(quizId)}/questions/${encodeURIComponent(questionId)}`,
    { method: "PUT", body: draft },
  );
  return response.data as BackendQuizQuestion;
}

export async function deleteQuizQuestion(quizId: string, questionId: string) {
  await apiRequest<ApiResponse<unknown>>(
    `/api/quizzes/${encodeURIComponent(quizId)}/questions/${encodeURIComponent(questionId)}`,
    {
      method: "DELETE",
    },
  );
}

export async function getTodayQuizAnalytics(signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<QuizAnalytics>>(
    "/api/internal/quizzes/analytics/today/performance",
    { signal },
  );
  return normalizeQuizAnalytics(response.data);
}

export async function getTeacherQuizResults(quizId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<TeacherQuizResults>>(
    `/api/quizzes/${encodeURIComponent(quizId)}/results`,
    { signal },
  );
  return response.data as TeacherQuizResults;
}

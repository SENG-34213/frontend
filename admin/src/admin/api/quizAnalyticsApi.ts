import type { ApiResponse } from "../auth/authTypes";
import { apiRequest } from "./client";

export interface AdminQuizAnalyticsItem {
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
}

export interface AdminQuizAnalytics {
  date: string;
  resultType: string;
  quizzes: AdminQuizAnalyticsItem[];
}

const finiteNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

function normalizeAdminQuizAnalytics(value: unknown): AdminQuizAnalytics | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  if (typeof source.date !== "string" || typeof source.resultType !== "string") return null;
  if (!Array.isArray(source.quizzes)) {
    return { date: source.date, resultType: source.resultType, quizzes: [] };
  }

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
    const requiredMetrics = [
      totalMarks,
      passMark,
      submittedAttempts,
      participants,
      passedAttempts,
      belowPassThresholdAttempts,
    ];
    if (
      !quizId ||
      !courseId ||
      !quizTitle ||
      requiredMetrics.some((metric) => metric === undefined)
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

export async function fetchTodayAdminQuizAnalytics(): Promise<AdminQuizAnalytics | null> {
  const response = await apiRequest<ApiResponse<AdminQuizAnalytics>>(
    "/api/internal/quizzes/analytics/today/performance",
  );
  return normalizeAdminQuizAnalytics(response.data);
}

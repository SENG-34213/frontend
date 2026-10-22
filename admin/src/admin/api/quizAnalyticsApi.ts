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

export async function fetchTodayAdminQuizAnalytics(): Promise<AdminQuizAnalytics | null> {
  const response = await apiRequest<ApiResponse<AdminQuizAnalytics>>(
    "/api/internal/quizzes/analytics/today/performance",
  );
  return response.data ?? null;
}

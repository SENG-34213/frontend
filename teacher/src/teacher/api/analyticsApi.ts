import { getTeacherDashboard, type TeacherDashboardData } from "./dashboardApi";
import { getTodayQuizAnalytics, type QuizAnalytics } from "./quizApi";

export type TeacherAnalyticsData = {
  dashboard: TeacherDashboardData | null;
  quiz: QuizAnalytics | null;
};

export async function getTeacherAnalytics(signal?: AbortSignal): Promise<TeacherAnalyticsData> {
  const [dashboardResult, quizResult] = await Promise.allSettled([
    getTeacherDashboard(signal),
    getTodayQuizAnalytics(signal),
  ]);

  return {
    dashboard: dashboardResult.status === "fulfilled" ? (dashboardResult.value ?? null) : null,
    quiz: quizResult.status === "fulfilled" ? quizResult.value : null,
  };
}

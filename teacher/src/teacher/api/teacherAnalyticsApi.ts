import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type TeacherAnalytics = {
  courseId: string;
  period: "WEEK" | "MONTH" | "TERM" | string;
  summary?: {
    studentCount: number;
    submissionRate?: number | string | null;
    attendanceAverage?: number | string | null;
    averagePercentage?: number | string | null;
    gpa?: number | string | null;
    interventionCount: number;
  } | null;
  gradeDistribution: Array<{ grade: string; count: number; percentage?: number | string | null }>;
  attendanceCorrelation: Array<{
    attendanceRange: string;
    averageAssessmentPercentage?: number | string | null;
    studentCount: number;
  }>;
  atRiskStudents: Array<{
    studentId: string;
    studentName?: string | null;
    attendancePercentage?: number | string | null;
    averagePercentage?: number | string | null;
    reason?: string | null;
  }>;
  attendance?: { attendanceRate?: number | string | null } | null;
  assignmentPerformance?: { averagePercentage?: number | string | null } | null;
  quizPerformance?: { averagePercentage?: number | string | null } | null;
  examPerformance?: { averagePercentage?: number | string | null } | null;
  courseTrends: Array<{
    courseId: string;
    courseName: string;
    attendanceRate?: number | string | null;
    assignmentAverage?: number | string | null;
    quizAverage?: number | string | null;
    examAverage?: number | string | null;
  }>;
};

export async function getTeacherCourseAnalytics(
  courseId: string,
  period: "WEEK" | "MONTH" | "TERM",
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ courseId, period });
  const response = await apiRequest<ApiResponse<TeacherAnalytics>>(
    `/api/v1/teacher/analytics?${params.toString()}`,
    { signal },
  );
  return response.data ?? null;
}

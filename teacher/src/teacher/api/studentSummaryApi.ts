import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type TeacherStudentAcademicSummary = {
  studentId: string;
  courseId: string;
  attendancePercentage?: number | string | null;
  absentCount: number;
  assignmentAverage?: number | string | null;
  quizAverage?: number | string | null;
  examAverage?: number | string | null;
  overallPercentage?: number | string | null;
  gpa?: number | string | null;
  submissionsPending: number;
  lastActiveAt?: string | null;
};

export async function getTeacherStudentAcademicSummary(
  studentId: string,
  courseId: string,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ courseId });
  const response = await apiRequest<ApiResponse<TeacherStudentAcademicSummary>>(
    `/api/v1/teacher/students/${encodeURIComponent(studentId)}/summary?${params.toString()}`,
    { signal },
  );
  return response.data ?? null;
}

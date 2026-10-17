import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type BackendAttendanceSummary = {
  studentId: string;
  courseId: string;
  completedSessions?: number;
  presentCount?: number;
  lateCount?: number;
  absentCount?: number;
  attendedCount?: number;
  attendancePercentage?: number;
};

export async function getCourseStudentIds(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<string[]>>(
    `/api/v1/enrollments/courses/${encodeURIComponent(courseId)}/students`,
    { signal },
  );
  return response.data ?? [];
}

export async function getStudentAttendanceSummary(
  studentId: string,
  courseId: string,
  signal?: AbortSignal,
) {
  const response = await apiRequest<ApiResponse<BackendAttendanceSummary>>(
    `/api/v1/attendance/students/${encodeURIComponent(studentId)}/courses/${encodeURIComponent(courseId)}`,
    { signal },
  );
  return response.data;
}

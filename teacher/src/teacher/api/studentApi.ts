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

export type BackendStudentProfile = {
  id: string;
  name?: string;
  email?: string;
  studentNumber?: string;
  avatar?: string;
  program?: string;
  status?: string;
};

export async function getCourseStudentIds(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<string[]>>(
    `/api/v1/enrollments/courses/${encodeURIComponent(courseId)}/students`,
    { signal },
  );
  return response.data ?? [];
}

export async function getStudentProfiles(studentIds: string[], signal?: AbortSignal) {
  const uniqueIds = Array.from(new Set(studentIds.filter(Boolean)));
  if (uniqueIds.length === 0) return [];
  const params = new URLSearchParams();
  uniqueIds.forEach((studentId) => params.append("ids", studentId));
  const response = await apiRequest<ApiResponse<BackendStudentProfile[]>>(
    `/api/v1/users/students/lookup?${params.toString()}`,
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

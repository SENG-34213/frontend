import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type BackendAttendanceStatus = "NOT_MARKED" | "PRESENT" | "ABSENT" | "LATE";
export type BackendAttendanceSessionStatus = "OPEN" | "COMPLETED" | "CANCELLED";

export type BackendAttendanceRecord = {
  id: string;
  studentId: string;
  status: BackendAttendanceStatus;
  remarks?: string;
  markedAt?: string;
  updatedAt?: string;
};

export type BackendAttendanceSession = {
  id: string;
  courseId: string;
  title: string;
  attendanceDate: string;
  startTime: string;
  endTime: string;
  mode?: "PHYSICAL" | "ONLINE";
  status: BackendAttendanceSessionStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  records?: BackendAttendanceRecord[];
};

export type CreateAttendanceSessionRequest = {
  courseId: string;
  title: string;
  attendanceDate: string;
  startTime: string;
  endTime: string;
};

export type AttendanceRecordMarkRequest = {
  studentId: string;
  status: BackendAttendanceStatus;
  remarks?: string;
};

export async function createAttendanceSession(
  request: CreateAttendanceSessionRequest,
  signal?: AbortSignal,
) {
  const response = await apiRequest<ApiResponse<BackendAttendanceSession>>(
    "/api/v1/attendance/sessions",
    { method: "POST", body: request, signal },
  );
  return response.data;
}

export async function getCourseAttendanceSessions(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendAttendanceSession[]>>(
    `/api/v1/attendance/courses/${encodeURIComponent(courseId)}/sessions`,
    { signal },
  );
  return response.data ?? [];
}

export async function getAttendanceSession(sessionId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendAttendanceSession>>(
    `/api/v1/attendance/sessions/${encodeURIComponent(sessionId)}`,
    { signal },
  );
  return response.data;
}

export async function updateAttendanceRecords(
  sessionId: string,
  records: AttendanceRecordMarkRequest[],
) {
  const response = await apiRequest<ApiResponse<BackendAttendanceSession>>(
    `/api/v1/attendance/sessions/${encodeURIComponent(sessionId)}/records`,
    { method: "PUT", body: { records } },
  );
  return response.data;
}

export async function completeAttendanceSession(sessionId: string) {
  const response = await apiRequest<ApiResponse<BackendAttendanceSession>>(
    `/api/v1/attendance/sessions/${encodeURIComponent(sessionId)}/complete`,
    { method: "POST" },
  );
  return response.data;
}

export async function cancelAttendanceSession(sessionId: string) {
  const response = await apiRequest<ApiResponse<BackendAttendanceSession>>(
    `/api/v1/attendance/sessions/${encodeURIComponent(sessionId)}/cancel`,
    { method: "POST" },
  );
  return response.data;
}

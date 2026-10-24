import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export interface AdminExamResponse {
  id: string;
  courseId: string;
  title: string;
  venue?: string | null;
  examDate: string;
  startTime: string;
  endTime: string;
  status: "DRAFT" | "SCHEDULED" | "MARKING" | "COMPLETED" | "CANCELLED";
}

export async function fetchCourseExaminations(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<AdminExamResponse[]>>(
    `/api/v1/exams/courses/${encodeURIComponent(courseId)}`,
    { signal },
  );
  return response.data ?? [];
}

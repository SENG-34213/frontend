import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export interface AdminAssignmentRecord {
  id: string;
  courseId: string;
  teacherId?: string;
  title: string;
  description?: string;
  startDate: string;
  dueDate: string;
  maxMarks: number;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  totalSubmissions?: number;
  gradedCount?: number;
}

export async function fetchCourseAssignments(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<AdminAssignmentRecord[]>>(
    `/api/v1/courses/${encodeURIComponent(courseId)}/assignments`,
    { signal },
  );
  return response.data ?? [];
}

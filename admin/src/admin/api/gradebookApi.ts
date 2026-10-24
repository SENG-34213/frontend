import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export interface AdminGradebookItem {
  assessmentId: string;
  title: string;
  score?: number | string | null;
  maxScore?: number | string | null;
  percentage?: number | string | null;
  status?: string | null;
  updatedAt?: string | null;
}

export interface AdminGradebookStudent {
  studentId: string;
  studentNumber?: string | null;
  studentName?: string | null;
  assignments?: AdminGradebookItem[];
  quizzes?: AdminGradebookItem[];
  exams?: AdminGradebookItem[];
}

export interface AdminCourseGradebook {
  courseId: string;
  students: AdminGradebookStudent[];
}

export async function fetchAdminCourseGradebook(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<AdminCourseGradebook>>(
    `/api/v1/teacher/gradebook?courseId=${encodeURIComponent(courseId)}`,
    { signal },
  );
  return response.data ?? null;
}

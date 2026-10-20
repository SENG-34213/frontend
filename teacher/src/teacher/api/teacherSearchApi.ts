import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type TeacherSearchResult = {
  id: string;
  type: "course" | "student" | "assignment" | "quiz" | "exam" | string;
  title: string;
  subtitle?: string | null;
  courseId?: string | null;
  navigationTarget?: string | null;
};

export type TeacherSearchResponse = {
  results: TeacherSearchResult[];
  total: number;
};

export async function searchTeacherWorkspace(query: string, signal?: AbortSignal, limit = 50) {
  const params = new URLSearchParams({
    q: query,
    types: "course,student,assignment,quiz,exam",
    limit: String(limit),
  });
  const response = await apiRequest<ApiResponse<TeacherSearchResponse>>(
    `/api/v1/teacher/search?${params.toString()}`,
    { signal },
  );
  return response.data ?? { results: [], total: 0 };
}

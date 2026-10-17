import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type BackendCourse = {
  id: string;
  courseName: string;
  courseDescription?: string;
  courseThumbnail?: string;
  assignedTeacherId?: string;
  subject?: string;
  online?: boolean;
  visible?: boolean;
  isPublished?: boolean;
  courseStatus?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  numberOfStudents?: number;
};

export async function getTeacherCourses(signal?: AbortSignal): Promise<BackendCourse[]> {
  const response = await apiRequest<ApiResponse<BackendCourse[]>>("/api/v1/course/my-courses", {
    signal,
  });

  return response.data ?? [];
}

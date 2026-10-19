import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";
import type { Course } from "../types";

export type BackendCourse = {
  id: string;
  courseName: string;
  code?: string;
  title?: string;
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

export type CreateCoursePayload = {
  courseName: string;
  courseDescription: string;
  courseThumbnail?: string;
  gradeId: string;
  assignedTeacherId: string;
  subject: string;
  isOnline?: boolean;
  isVisible?: boolean;
  isPublished?: boolean;
};

export async function getTeacherCourses(signal?: AbortSignal): Promise<BackendCourse[]> {
  const response = await apiRequest<ApiResponse<BackendCourse[]>>("/api/v1/course/my-courses", {
    signal,
  });

  return response.data ?? [];
}

export async function createCourse(payload: CreateCoursePayload) {
  const response = await apiRequest<ApiResponse<BackendCourse>>("/api/v1/course", {
    method: "POST",
    body: payload,
  });
  if (!response.data) throw new Error("The server returned no created course.");
  return response.data;
}

export async function getCourseById(
  courseId: string,
  signal?: AbortSignal,
): Promise<BackendCourse> {
  const response = await apiRequest<ApiResponse<BackendCourse>>(
    `/api/v1/course/${encodeURIComponent(courseId)}`,
    { signal },
  );

  if (!response.data) {
    throw new Error("Course details were not returned by the server.");
  }
  return response.data;
}

export function mapBackendCourse(course: BackendCourse): Course {
  return {
    id: course.id,
    code: course.subject || "COURSE",
    title: course.courseName,
    description: course.courseDescription || "No course description available.",
    category: course.subject || "Academic Course",
    level: "Undergraduate",
    semester: "Current Semester",
    academicYear: "",
    enrolledCount: course.numberOfStudents ?? 0,
    maxCapacity: course.numberOfStudents ?? 0,
    status:
      course.courseStatus === "PUBLISHED"
        ? "Active"
        : course.courseStatus === "ARCHIVED"
          ? "Archived"
          : "Draft",
    coverTheme: "indigo",
    modulesCount: 0,
    assignmentsCount: 0,
    averageGrade: 0,
  };
}

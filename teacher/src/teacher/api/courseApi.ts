import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";
import type { Course } from "../types";

export type BackendCourse = {
  id: string;
  courseName: string;
  courseCode?: string;
  title?: string;
  courseDescription?: string;
  courseThumbnail?: string;
  assignedTeacherId?: string;
  gradeId?: string;
  gradeName?: string;
  subject?: string;
  level?: string | null;
  semester?: string | null;
  academicYear?: string | null;
  online?: boolean;
  visible?: boolean;
  isPublished?: boolean;
  courseStatus?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedDate?: string;
  numberOfStudents?: number;
  moduleCount?: number | null;
  lessonCount?: number | null;
  assignmentCount?: number | null;
  quizCount?: number | null;
  examCount?: number | null;
  averageGrade?: number | string | null;
  maxCapacity?: number | null;
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
    code: course.courseCode || "",
    title: course.courseName,
    gradeId: course.gradeId,
    gradeName: course.gradeName,
    courseThumbnail: course.courseThumbnail,
    description: course.courseDescription || "",
    category: course.subject || "",
    level: course.level || "",
    semester: course.semester || "",
    academicYear: course.academicYear || "",
    enrolledCount: course.numberOfStudents ?? 0,
    maxCapacity: course.maxCapacity ?? 0,
    status:
      course.courseStatus === "PUBLISHED"
        ? "Active"
        : course.courseStatus === "ARCHIVED"
          ? "Archived"
          : "Draft",
    coverTheme: undefined,
    modulesCount: Number(course.moduleCount ?? 0),
    assignmentsCount: Number(course.assignmentCount ?? 0),
    averageGrade: Number(course.averageGrade ?? 0),
  };
}

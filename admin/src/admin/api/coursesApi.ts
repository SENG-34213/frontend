import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";
import type { Course } from "../types";

interface CourseApiResponse {
  id: string;
  courseName: string;
  courseDescription?: string | null;
  courseThumbnail?: string | null;
  courseFeeMonthly?: number | null;
  assignedTeacherId?: string | null;
  courseEnrollmentId?: string | null;
  gradeId?: string | null;
  subject?: string | null;
  online?: boolean;
  discountOfferPercent?: number | null;
  visible?: boolean;
  isPublished?: boolean;
  courseStatus?: string | null;
  publishedDate?: string | null;
  numberOfStudents?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateCoursePayload {
  courseName: string;
  courseDescription: string;
  courseThumbnail?: string;
  courseFeeMonthly: number;
  gradeId: string;
  assignedTeacherId: string;
  subject: string;
  isOnline: boolean;
  discountOfferPercent?: number;
  isVisible: boolean;
  isPublished: boolean;
  courseEnrollmentId?: string | null;
}

const statusMap: Record<string, Course["status"]> = {
  PUBLISHED: "ACTIVE",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  DELETED: "ARCHIVED",
};

function createCourseCode(course: CourseApiResponse) {
  const shortId = course.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return course.subject?.trim().toUpperCase() || `COURSE-${shortId}`;
}

export function mapCourseResponse(course: CourseApiResponse): Course {
  const enrollmentCount = Number.isFinite(course.numberOfStudents)
    ? course.numberOfStudents || 0
    : 0;
  const isPublished = Boolean(course.isPublished);
  const status = course.courseStatus?.toUpperCase();

  return {
    id: course.id,
    code: createCourseCode(course),
    title: course.courseName,
    courseName: course.courseName,
    teacherId: course.assignedTeacherId || "",
    teacherName: course.assignedTeacherId ? "Assigned faculty" : "Unassigned faculty",
    assignedTeacherId: course.assignedTeacherId || undefined,
    grade: course.gradeId || "Grade not specified",
    gradeId: course.gradeId || undefined,
    enrollmentCount,
    maxCapacity: Math.max(enrollmentCount, 1),
    status: statusMap[status || ""] || (isPublished ? "ACTIVE" : "UPCOMING"),
    description: course.courseDescription || "No course description available.",
    courseDescription: course.courseDescription || undefined,
    courseThumbnail: course.courseThumbnail || undefined,
    courseFeeMonthly: course.courseFeeMonthly ?? undefined,
    courseEnrollmentId: course.courseEnrollmentId || null,
    isOnline: course.online,
    online: course.online,
    isVisible: course.visible,
    visible: course.visible,
    isPublished,
    courseStatus:
      status === "PUBLISHED" || status === "DRAFT" || status === "ARCHIVED" ? status : undefined,
    numberOfStudents: enrollmentCount,
    studentCount: enrollmentCount,
    publishedDate: course.publishedDate || null,
    createdAt: course.createdAt || undefined,
    updatedAt: course.updatedAt || undefined,
    modulesCount: 0,
    category: course.subject || "General",
    subject: course.subject || undefined,
    startDate: course.createdAt || "",
    endDate: course.updatedAt || "",
  };
}

export async function fetchCourses(): Promise<Course[]> {
  const response = await apiRequest<ApiResponse<CourseApiResponse[]>>("/api/v1/course");
  return response.data.map(mapCourseResponse);
}

export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  const response = await apiRequest<ApiResponse<CourseApiResponse>>("/api/v1/course", {
    method: "POST",
    body: payload,
  });
  if (!response.data) {
    throw new Error(response.message || "The course service returned an empty response.");
  }
  return mapCourseResponse(response.data);
}

export async function updateCourse(courseId: string, payload: CreateCoursePayload): Promise<Course> {
  const response = await apiRequest<ApiResponse<CourseApiResponse>>(`/api/v1/course/${courseId}`, {
    method: "PUT",
    body: payload,
  });
  if (!response.data) {
    throw new Error(response.message || "The course service returned an empty response.");
  }
  return mapCourseResponse(response.data);
}

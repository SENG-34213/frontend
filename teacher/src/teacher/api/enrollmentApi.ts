import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type EnrollmentStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";

export type BackendEnrollment = {
  id: string;
  studentId: string;
  courseIds: string[];
  enrolledOn?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: EnrollmentStatus;
};

export type EnrollmentCreateRequest = {
  studentId: string;
  courseIds: string[];
  status?: EnrollmentStatus;
};

export type EnrollmentUpdateRequest = {
  courseIds?: string[];
  status?: EnrollmentStatus;
};

export async function getCourseEnrollments(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendEnrollment[]>>(
    `/api/v1/enrollments/courses/${encodeURIComponent(courseId)}`,
    { signal },
  );
  return response.data ?? [];
}

export async function createEnrollment(payload: EnrollmentCreateRequest) {
  const response = await apiRequest<ApiResponse<BackendEnrollment>>("/api/v1/enrollments", {
    method: "POST",
    body: payload,
  });
  return response.data as BackendEnrollment;
}

export async function updateEnrollment(enrollmentId: string, payload: EnrollmentUpdateRequest) {
  const response = await apiRequest<ApiResponse<BackendEnrollment>>(
    `/api/v1/enrollments/${encodeURIComponent(enrollmentId)}`,
    { method: "PUT", body: payload },
  );
  return response.data as BackendEnrollment;
}

export async function deleteEnrollment(enrollmentId: string) {
  await apiRequest<ApiResponse<unknown>>(
    `/api/v1/enrollments/${encodeURIComponent(enrollmentId)}`,
    { method: "DELETE" },
  );
}

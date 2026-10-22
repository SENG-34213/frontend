import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";
import type { Course, EnrollmentRecord, StudentProfile } from "../types";

export interface EnrollmentApiResponse {
  id: string;
  studentId: string;
  courseIds: string[];
  enrolledOn: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchEnrollments(): Promise<EnrollmentApiResponse[]> {
  const response = await apiRequest<ApiResponse<EnrollmentApiResponse[]>>("/api/v1/enrollments");
  return response.data || [];
}

export async function createEnrollment(studentId: string, courseIds: string[]) {
  const response = await apiRequest<ApiResponse<EnrollmentApiResponse>>("/api/v1/enrollments", {
    method: "POST",
    body: { studentId, courseIds },
  });
  if (!response.data) throw new Error(response.message || "Enrollment was not created.");
  return response.data;
}

export async function updateEnrollment(enrollmentId: string, courseIds: string[]) {
  const response = await apiRequest<ApiResponse<EnrollmentApiResponse>>(
    `/api/v1/enrollments/${enrollmentId}`,
    { method: "PUT", body: { courseIds } },
  );
  if (!response.data) throw new Error(response.message || "Enrollment was not updated.");
  return response.data;
}

export async function deleteEnrollment(enrollmentId: string) {
  await apiRequest<ApiResponse<unknown>>(`/api/v1/enrollments/${enrollmentId}`, {
    method: "DELETE",
  });
}

export function mapEnrollmentRecords(
  enrollments: EnrollmentApiResponse[],
  students: StudentProfile[],
  courses: Course[],
): EnrollmentRecord[] {
  return enrollments.flatMap((enrollment) => {
    const student = students.find((item) => item.id === enrollment.studentId);
    return enrollment.courseIds.map((courseId) => {
      const course = courses.find((item) => item.id === courseId);
      return {
        id: `${enrollment.id}:${courseId}`,
        studentId: enrollment.studentId,
        studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown student",
        studentEmail: student?.email || "",
        courseId,
        courseCode: course?.code || "Course",
        courseTitle: course?.title || "Course unavailable",
        enrolledDate: enrollment.enrolledOn,
        status: "ACTIVE" as const,
        grade: student?.grade,
        progressPercentage: 0,
        enrollmentId: enrollment.id,
      };
    });
  });
}

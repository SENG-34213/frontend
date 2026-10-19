import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type TeacherDashboardCalendarEvent = {
  id: string;
  title: string;
  eventType: string;
  startDateTime: string;
  endDateTime: string;
  courseId?: string | null;
  location?: string | null;
};

export type TeacherDashboardPendingGrading = {
  submissionId: string;
  assignmentId: string;
  courseId: string;
  assignmentTitle: string;
  studentId: string;
  studentName?: string | null;
  submittedAt?: string | null;
};

export type TeacherDashboardCoursePerformance = {
  courseId: string;
  courseName: string;
  studentCount: number;
  activeAssignmentCount: number;
  submissionCount: number;
  gradedSubmissionCount: number;
  gradingRate: number;
};

export type TeacherDashboardData = {
  courseCount: number;
  studentCount: number;
  activeAssignmentCount: number;
  pendingReviewCount: number;
  upcomingExamCount: number;
  todayClassCount: number;
  todaySchedule: TeacherDashboardCalendarEvent[];
  pendingGrading: TeacherDashboardPendingGrading[];
  coursePerformance: TeacherDashboardCoursePerformance[];
};

export async function getTeacherDashboard(signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<TeacherDashboardData>>(
    "/api/v1/teacher/dashboard",
    {
      signal,
    },
  );
  return response.data;
}

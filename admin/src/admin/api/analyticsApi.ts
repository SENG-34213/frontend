import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export interface AdminAnalyticsOverview {
  users?: {
    totalUsers?: number;
    students?: number;
    teachers?: number;
    admins?: number;
  };
  courses?: {
    totalCourses?: number;
    activeCourses?: number;
  };
  enrollment?: {
    activeEnrollments?: number;
    newThisMonth?: number;
  };
  attendance?: {
    averageAttendance?: number;
  };
  assessment?: {
    assignmentCompletionRate?: number;
    averageExamScore?: number;
    averageQuizScore?: number;
  };
  payments?: {
    revenue?: number;
    successfulPayments?: number;
  };
  partial?: boolean;
}

export async function fetchAdminAnalyticsOverview(): Promise<AdminAnalyticsOverview> {
  const response = await apiRequest<ApiResponse<AdminAnalyticsOverview>>(
    "/api/v1/analytics/admin/overview",
  );

  return response.data ?? {};
}

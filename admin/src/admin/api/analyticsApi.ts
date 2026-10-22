import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export interface AdminAnalyticsOverview {
  users?: {
    totalUsers?: number;
    students?: number;
    teachers?: number;
    admins?: number;
    accountStatusMix?: Record<string, number>;
  };
  courses?: {
    totalCourses?: number;
    activeCourses?: number;
    newThisMonth?: number;
  };
  enrollment?: {
    activeEnrollments?: number;
    uniqueStudents?: number;
    newThisMonth?: number;
    coursePopularity?: Array<{
      courseId?: string;
      enrollmentCount?: number;
    }>;
    enrollmentTrend?: Record<string, number>;
  };
  attendance?: {
    averageAttendance?: number;
  };
  assignments?: {
    completionRate?: number;
    averageScore?: number;
    missingRate?: number;
  };
  quizzes?: {
    completionRate?: number;
    averageScore?: number;
    missingRate?: number;
  };
  exams?: {
    completionRate?: number;
    averageScore?: number;
    missingRate?: number;
  };
  payments?: {
    revenue?: number;
    successfulPayments?: number;
    failedPayments?: number;
    refundedPayments?: number;
  };
  partial?: boolean;
  unavailableSections?: string[];
}

export async function fetchAdminAnalyticsOverview(): Promise<AdminAnalyticsOverview> {
  const response = await apiRequest<ApiResponse<AdminAnalyticsOverview>>(
    "/api/v1/analytics/admin/overview",
  );

  return response.data ?? {};
}

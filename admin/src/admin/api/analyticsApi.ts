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

function optionalNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return value;
}

function numericRecord(value: unknown): Record<string, number> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entries = Object.entries(value).flatMap(([key, entry]) => {
    const normalized = optionalNumber(entry);
    return normalized === undefined ? [] : [[key, normalized] as const];
  });
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function metricSection(
  value: unknown,
  fields: string[],
): Record<string, number | undefined> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  return Object.fromEntries(fields.map((field) => [field, optionalNumber(source[field])]));
}

function normalizeOverview(value: unknown): AdminAnalyticsOverview {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const users = metricSection(source.users, ["totalUsers", "students", "teachers", "admins"]);
  const courses = metricSection(source.courses, ["totalCourses", "activeCourses", "newThisMonth"]);
  const enrollment = metricSection(source.enrollment, [
    "activeEnrollments",
    "uniqueStudents",
    "newThisMonth",
  ]);
  const attendance = metricSection(source.attendance, ["averageAttendance"]);
  const assignments = metricSection(source.assignments, [
    "completionRate",
    "averageScore",
    "missingRate",
  ]);
  const quizzes = metricSection(source.quizzes, ["completionRate", "averageScore", "missingRate"]);
  const exams = metricSection(source.exams, ["completionRate", "averageScore", "missingRate"]);
  const payments = metricSection(source.payments, [
    "revenue",
    "successfulPayments",
    "failedPayments",
    "refundedPayments",
  ]);
  const rawEnrollment = source.enrollment as Record<string, unknown> | undefined;
  const rawUsers = source.users as Record<string, unknown> | undefined;
  const rawCoursePopularity = Array.isArray(rawEnrollment?.coursePopularity)
    ? rawEnrollment.coursePopularity.flatMap((course) => {
        if (!course || typeof course !== "object") return [];
        const entry = course as Record<string, unknown>;
        const courseId = typeof entry.courseId === "string" ? entry.courseId : undefined;
        const enrollmentCount = optionalNumber(entry.enrollmentCount);
        return courseId && enrollmentCount !== undefined ? [{ courseId, enrollmentCount }] : [];
      })
    : undefined;

  return {
    users: users
      ? { ...users, accountStatusMix: numericRecord(rawUsers?.accountStatusMix) }
      : undefined,
    courses,
    enrollment: enrollment
      ? {
          ...enrollment,
          coursePopularity: rawCoursePopularity,
          enrollmentTrend: numericRecord(rawEnrollment?.enrollmentTrend),
        }
      : undefined,
    attendance,
    assignments,
    quizzes,
    exams,
    payments,
    partial: source.partial === true,
    unavailableSections: Array.isArray(source.unavailableSections)
      ? source.unavailableSections.filter(
          (section): section is string => typeof section === "string",
        )
      : undefined,
  };
}

export async function fetchAdminAnalyticsOverview(): Promise<AdminAnalyticsOverview> {
  const response = await apiRequest<
    AdminAnalyticsOverview | ApiResponse<AdminAnalyticsOverview>
  >(
    "/api/v1/analytics/admin/overview",
  );

  // Analytics Service returns the record directly, while older deployments may
  // still wrap it in the platform's standard `{ data }` response envelope.
  // Accept both shapes so the dashboard remains compatible across environments.
  const payload =
    response && typeof response === "object" && "data" in response
      ? (response as ApiResponse<AdminAnalyticsOverview>).data
      : response;

  return normalizeOverview(payload);
}

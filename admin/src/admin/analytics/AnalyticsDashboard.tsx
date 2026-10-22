"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CalendarCheck2,
  CircleDollarSign,
  GraduationCap,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Users,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { ApiError } from "../api/client";
import { fetchAdminAnalyticsOverview, type AdminAnalyticsOverview } from "../api/analyticsApi";

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

function nonNegative(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function formatNumber(value: number | undefined): string {
  const normalized = nonNegative(value);
  return normalized === undefined ? "—" : numberFormatter.format(normalized);
}

function formatPercentage(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return `${Math.min(100, Math.max(0, value)).toFixed(1)}%`;
}

function formatCurrency(value: number | undefined): string {
  const normalized = nonNegative(value);
  return normalized === undefined ? "—" : currencyFormatter.format(normalized);
}

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .split(/[_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return "You do not have permission to view platform analytics.";
  }

  if (error instanceof ApiError && error.status === 401) {
    return "Your admin session has expired. Please sign in again.";
  }

  return "Analytics could not be loaded right now. Please try again.";
}

function MetricUnavailable({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
      {label} is not available yet.
    </div>
  );
}

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async (refresh = false) => {
    setError("");
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const nextAnalytics = await fetchAdminAnalyticsOverview();
      setAnalytics(nextAnalytics);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void loadAnalytics();
    }, 0);

    return () => window.clearTimeout(initialLoad);
  }, [loadAnalytics]);

  const users = analytics?.users;
  const courses = analytics?.courses;
  const enrollment = analytics?.enrollment;
  const attendance = analytics?.attendance;
  const assignments = analytics?.assignments;
  const quizzes = analytics?.quizzes;
  const exams = analytics?.exams;
  const payments = analytics?.payments;
  const accountStatusMix = Object.entries(users?.accountStatusMix ?? {});
  const enrollmentTrend = Object.entries(enrollment?.enrollmentTrend ?? {}).flatMap(
    ([period, count]) => {
      const normalized = nonNegative(count);
      return normalized === undefined ? [] : [[period, normalized] as const];
    },
  );
  const coursePopularity = enrollment?.coursePopularity ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Analytics & Reporting"
        description="Cross-service operational intelligence from the live Analytics Service."
        breadcrumbs={[{ label: "Admin" }, { label: "Platform Operations" }, { label: "Analytics" }]}
        actions={
          <button
            type="button"
            onClick={() => void loadAnalytics(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
        }
      />

      {isLoading ? (
        <div
          role="status"
          className="flex min-h-48 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading live platform analytics…
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void loadAnalytics(true)}
            className="shrink-0 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {analytics?.partial && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
            >
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p>
                  Some analytics sections are temporarily incomplete. Available values are shown
                  below.
                </p>
                {analytics.unavailableSections?.length ? (
                  <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
                    Unavailable: {analytics.unavailableSections.map(formatLabel).join(", ")}.
                  </p>
                ) : null}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={formatNumber(users?.totalUsers)}
              subtitle={`${formatNumber(users?.students)} students`}
              icon={Users}
            />
            <StatCard
              title="Active Courses"
              value={formatNumber(courses?.activeCourses)}
              subtitle={`${formatNumber(courses?.newThisMonth)} new this month`}
              icon={BookOpen}
            />
            <StatCard
              title="Average Attendance"
              value={formatPercentage(attendance?.averageAttendance)}
              subtitle={`${formatNumber(enrollment?.uniqueStudents)} unique students`}
              icon={CalendarCheck2}
            />
            <StatCard
              title="Successful Payments"
              value={formatNumber(payments?.successfulPayments)}
              subtitle={formatCurrency(payments?.revenue)}
              icon={CircleDollarSign}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Platform user distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current role totals returned by the Analytics Service.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  title="Students"
                  value={formatNumber(users?.students)}
                  icon={GraduationCap}
                />
                <StatCard title="Teachers" value={formatNumber(users?.teachers)} icon={Users} />
                <StatCard title="Admins" value={formatNumber(users?.admins)} icon={Award} />
              </div>
            </section>

            <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Assessment performance
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current completion and average scores returned by the Analytics Service.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard
                  title="Assignment Completion"
                  value={formatPercentage(assignments?.completionRate)}
                  subtitle={`${formatPercentage(assignments?.missingRate)} missing`}
                />
                <StatCard
                  title="Average Quiz Score"
                  value={formatPercentage(quizzes?.averageScore)}
                  subtitle={`${formatPercentage(quizzes?.completionRate)} completed`}
                />
                <StatCard
                  title="Average Exam Score"
                  value={formatPercentage(exams?.averageScore)}
                  subtitle={`${formatPercentage(exams?.completionRate)} completed`}
                />
              </div>
            </section>
          </div>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Enrolment activity
              </h2>
              {enrollment ? (
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    title="Active Enrolments"
                    value={formatNumber(enrollment.activeEnrollments)}
                  />
                  <StatCard title="New This Month" value={formatNumber(enrollment.newThisMonth)} />
                </div>
              ) : (
                <MetricUnavailable label="Enrolment activity" />
              )}
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Historical trends
              </h2>
              {enrollmentTrend.length > 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Enrollment activity by period
                    </span>
                  </div>
                  <div className="space-y-3">
                    {enrollmentTrend.map(([period, count]) => (
                      <div key={period} className="flex items-center gap-3 text-sm">
                        <span className="w-24 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                          {period}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{
                              width: `${Math.min(100, Math.max(4, (count / Math.max(...enrollmentTrend.map(([, value]) => value), 1)) * 100))}%`,
                            }}
                          />
                        </div>
                        <span className="w-10 text-right font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                          {formatNumber(count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <MetricUnavailable label="Historical enrollment trends" />
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Account status mix
                </h2>
              </div>
              {accountStatusMix.length > 0 ? (
                <div className="space-y-3">
                  {accountStatusMix.map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatLabel(status)}
                      </span>
                      <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                        {formatNumber(count)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <MetricUnavailable label="Account status data" />
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Popular courses
                </h2>
              </div>
              {coursePopularity.length > 0 ? (
                <div className="space-y-3">
                  {coursePopularity.slice(0, 5).map((course, index) => (
                    <div
                      key={course.courseId ?? index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate pr-3 text-slate-500 dark:text-slate-400">
                        Course {course.courseId?.slice(0, 8) ?? "—"}
                      </span>
                      <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                        {formatNumber(course.enrollmentCount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <MetricUnavailable label="Course popularity data" />
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Payment health
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StatCard title="Successful" value={formatNumber(payments?.successfulPayments)} />
                <StatCard title="Failed" value={formatNumber(payments?.failedPayments)} />
                <StatCard title="Refunded" value={formatNumber(payments?.refundedPayments)} />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

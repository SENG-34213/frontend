"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Award,
  BookOpen,
  CalendarCheck2,
  CircleDollarSign,
  GraduationCap,
  Loader2,
  RefreshCcw,
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

function formatNumber(value: number | undefined): string {
  return value === undefined ? "—" : numberFormatter.format(value);
}

function formatPercentage(value: number | undefined): string {
  return value === undefined ? "—" : `${value.toFixed(1)}%`;
}

function formatCurrency(value: number | undefined): string {
  return value === undefined ? "—" : currencyFormatter.format(value);
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
  const assessment = analytics?.assessment;
  const payments = analytics?.payments;

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
              Some analytics sections are temporarily incomplete. Available values are shown below.
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
              subtitle={`${formatNumber(courses?.totalCourses)} total courses`}
              icon={BookOpen}
            />
            <StatCard
              title="Average Attendance"
              value={formatPercentage(attendance?.averageAttendance)}
              subtitle={`${formatNumber(enrollment?.activeEnrollments)} active enrollments`}
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
                  value={formatPercentage(assessment?.assignmentCompletionRate)}
                />
                <StatCard
                  title="Average Quiz Score"
                  value={formatPercentage(assessment?.averageQuizScore)}
                />
                <StatCard
                  title="Average Exam Score"
                  value={formatPercentage(assessment?.averageExamScore)}
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
              <MetricUnavailable label="Historical trend charts" />
            </div>
          </section>
        </>
      )}
    </div>
  );
};

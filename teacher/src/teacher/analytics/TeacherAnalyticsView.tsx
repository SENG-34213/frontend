import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { NavigationTab } from "../types";
import type { BackendCourse } from "../api/courseApi";
import { getTeacherCourseAnalytics, type TeacherAnalytics } from "../api/teacherAnalyticsApi";

interface TeacherAnalyticsViewProps {
  onNavigate: (tab: NavigationTab) => void;
  courses: BackendCourse[];
}

const value = (input: number | string | null | undefined) => (input == null ? null : Number(input));

export const TeacherAnalyticsView: React.FC<TeacherAnalyticsViewProps> = ({
  onNavigate,
  courses,
}) => {
  const [timeRange, setTimeRange] = useState<"TERM" | "MONTH" | "WEEK">("TERM");
  const [courseId, setCourseId] = useState("");
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId && courses[0]?.id) setCourseId(courses[0].id);
    if (courseId && !courses.some((course) => course.id === courseId)) setCourseId("");
  }, [courseId, courses]);

  useEffect(() => {
    if (!courseId) {
      setAnalytics(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getTeacherCourseAnalytics(courseId, timeRange, controller.signal)
      .then(setAnalytics)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setAnalytics(null);
          setError(
            requestError instanceof Error ? requestError.message : "Unable to load analytics.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [courseId, timeRange]);

  const summary = analytics?.summary;
  const attendanceAverage = value(
    summary?.attendanceAverage ?? analytics?.attendance?.attendanceRate,
  );
  const submissionRate = value(summary?.submissionRate);
  const averagePercentage = value(summary?.averagePercentage);
  const gradeDistribution = analytics?.gradeDistribution ?? [];
  const correlation = analytics?.attendanceCorrelation ?? [];
  const atRisk = analytics?.atRiskStudents ?? [];
  const courseTrends = analytics?.courseTrends ?? [];
  const cards: Array<{
    label: string;
    cardValue: number | string | null;
    Icon: LucideIcon;
    hint: string;
  }> = [
    {
      label: "Average Assessment",
      cardValue: averagePercentage,
      Icon: Award,
      hint: "Completed assessment results",
    },
    {
      label: "Submission Rate",
      cardValue: submissionRate,
      Icon: Users,
      hint: "Submitted student assessments",
    },
    {
      label: "Attendance Average",
      cardValue: attendanceAverage,
      Icon: Calendar,
      hint: "Present and late records",
    },
    {
      label: "Intervention Alerts",
      cardValue: summary?.interventionCount ?? null,
      Icon: AlertTriangle,
      hint: "Students needing attention",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Teaching Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Diagnostic insights from completed assessments and attendance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden shadow-2xs"
          >
            {courses.length === 0 && <option value="">No courses available</option>}
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseCode || course.courseName} — {course.courseName}
              </option>
            ))}
          </select>
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            {(["TERM", "MONTH", "WEEK"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === range ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                {range[0] + range.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, cardValue, Icon, hint }) => (
          <div key={label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium text-slate-500">{label}</span>
              <Icon className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {loading
                ? "—"
                : cardValue == null
                  ? "—"
                  : label === "Intervention Alerts"
                    ? cardValue
                    : `${Number(cardValue).toFixed(1)}%`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Grade Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Completed assessments for the selected period
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="space-y-3 pt-2">
            {gradeDistribution.map((item) => (
              <div key={item.grade} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Grade {item.grade}</span>
                  <span className="font-mono text-slate-600">
                    {item.count} students ({value(item.percentage) ?? 0}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${Math.min(100, value(item.percentage) ?? 0)}%` }}
                  />
                </div>
              </div>
            ))}
            {!gradeDistribution.length && (
              <p className="text-xs text-slate-400">No grade distribution is available.</p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Attendance vs. Assessment Performance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Empirical correlation across enrolled students
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-3 pt-2">
            {correlation.map((item) => {
              const score = value(item.averageAssessmentPercentage) ?? 0;
              return (
                <div key={item.attendanceRange} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {item.attendanceRange}% attendance
                    </span>
                    <span className="font-mono font-bold text-slate-900">Avg {score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, score)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {!correlation.length && (
              <p className="text-xs text-slate-400">No attendance correlation is available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Course Performance Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Attendance and assessment averages for your available courses
            </p>
          </div>
          <TrendingUp className="w-4 h-4 text-indigo-600" />
        </div>
        {courseTrends.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4 font-semibold">Course</th>
                  <th className="pb-3 px-2 text-right font-semibold">Attendance</th>
                  <th className="pb-3 px-2 text-right font-semibold">Assignments</th>
                  <th className="pb-3 px-2 text-right font-semibold">Quizzes</th>
                  <th className="pb-3 pl-2 text-right font-semibold">Exams</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courseTrends.map((course) => (
                  <tr key={course.courseId} className="text-slate-700">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-900">{course.courseName}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                        {course.courseId}
                      </p>
                    </td>
                    <td className="px-2 py-3 text-right font-mono tabular-nums">
                      {value(course.attendanceRate) == null
                        ? "—"
                        : `${Number(value(course.attendanceRate)).toFixed(1)}%`}
                    </td>
                    <td className="px-2 py-3 text-right font-mono tabular-nums">
                      {value(course.assignmentAverage) == null
                        ? "—"
                        : `${Number(value(course.assignmentAverage)).toFixed(1)}%`}
                    </td>
                    <td className="px-2 py-3 text-right font-mono tabular-nums">
                      {value(course.quizAverage) == null
                        ? "—"
                        : `${Number(value(course.quizAverage)).toFixed(1)}%`}
                    </td>
                    <td className="pl-2 py-3 text-right font-mono tabular-nums">
                      {value(course.examAverage) == null
                        ? "—"
                        : `${Number(value(course.examAverage)).toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-center text-xs text-slate-400">
            No cross-course comparison is available for this period.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-rose-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
              Students Needing Early Intervention ({atRisk.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">Attendance and assessment thresholds</span>
        </div>
        <div className="divide-y divide-slate-100">
          {atRisk.map((student) => (
            <div
              key={student.studentId}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {student.studentName || "Name unavailable"}
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  {student.studentId} · {student.reason || "At-risk indicators detected"}
                </p>
              </div>
              <button
                onClick={() => onNavigate("messages")}
                className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
              >
                Schedule Office Hours
              </button>
            </div>
          ))}
          {!atRisk.length && (
            <p className="p-6 text-center text-xs text-slate-400">
              No intervention alerts are available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  FileCheck,
  ClipboardList,
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { NavigationTab, NotificationItem, TeacherProfile } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { getTeacherDashboard, type TeacherDashboardData } from "../api/dashboardApi";

interface DashboardViewProps {
  teacher: TeacherProfile;
  onNavigate: (tab: NavigationTab, param?: string) => void;
  onGradeAssignment: (assignmentId: string) => void;
  onOpenAIWithPrompt: (prompt: string) => void;
  recentNotifications: NotificationItem[];
  notificationsLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  teacher,
  onNavigate,
  onGradeAssignment,
  onOpenAIWithPrompt,
  recentNotifications,
  notificationsLoading,
}) => {
  const [dashboard, setDashboard] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const firstName = teacher.name.trim().split(/\s+/)[0] || "Professor";

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    getTeacherDashboard(controller.signal)
      .then((data) => setDashboard(data ?? null))
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(
          requestError instanceof Error
            ? requestError
            : new Error("Dashboard data could not be loaded."),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : "Not available";
  const formatTime = (value?: string | null) =>
    value ? new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—";

  const todayClasses = (dashboard?.todaySchedule ?? [])
    .filter((event) => event.eventType.toUpperCase() === "CLASS")
    .map((event) => ({
      id: event.id,
      title: event.title,
      startTime: formatTime(event.startDateTime),
      location: event.location || "Not specified",
      description: formatDateTime(event.startDateTime),
    }));
  const pendingGradingAssignments = (dashboard?.pendingGrading ?? []).map((item) => ({
    id: item.assignmentId,
    submissionId: item.submissionId,
    courseCode: item.courseId.slice(0, 8),
    title: item.assignmentTitle,
    dueDate: formatDateTime(item.submittedAt),
    gradedCount: 0,
    totalSubmissions: 1,
  }));
  const activeCourses = (dashboard?.coursePerformance ?? []).map((course) => ({
    id: course.courseId,
    code: course.courseId.slice(0, 8),
    title: course.courseName,
    description: `${course.activeAssignmentCount} active assignments · ${course.submissionCount} submissions`,
    status: "Active",
    enrolledCount: course.studentCount,
    averageGrade: course.gradingRate,
  }));

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span>{error.message}</span>
          <button
            onClick={() => window.location.reload()}
            className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Fall Semester 2026
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Good morning, {firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's what's happening across your classes today. You have{" "}
            <span className="font-semibold text-slate-800">
              {dashboard?.todayClassCount ?? 0} upcoming lectures
            </span>{" "}
            and{" "}
            <span className="font-semibold text-indigo-700">
              {dashboard?.pendingReviewCount ?? 0} submissions
            </span>{" "}
            awaiting review.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate("attendance")}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => onNavigate("grading-workspace")}
            className="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Grading Queue</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: My Courses */}
        <div
          onClick={() => onNavigate("courses")}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-600 mb-2">
            <span className="text-xs font-medium text-slate-500">My Courses</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {isLoading ? "—" : (dashboard?.courseCount ?? 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Assigned teacher courses</p>
        </div>

        {/* Card 2: Total Students */}
        <div
          onClick={() => onNavigate("students")}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-600 mb-2">
            <span className="text-xs font-medium text-slate-500">Total Students</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {isLoading ? "—" : (dashboard?.studentCount ?? 0)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Unique enrolled students</p>
        </div>

        {/* Card 3: Active Assignments */}
        <div
          onClick={() => onNavigate("assignments")}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-600 mb-2">
            <span className="text-xs font-medium text-slate-500">Active Assignments</span>
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {isLoading ? "—" : (dashboard?.activeAssignmentCount ?? 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Published and not overdue</p>
        </div>

        {/* Card 4: Pending Submissions */}
        <div
          onClick={() => onNavigate("grading-workspace")}
          className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs bg-indigo-50/20 hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-medium text-indigo-900">Pending Review</span>
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums">
            {isLoading ? "—" : (dashboard?.pendingReviewCount ?? 0)}
          </div>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">Ready to grade</p>
        </div>

        {/* Card 5: Upcoming Exams */}
        <div
          onClick={() => onNavigate("exams")}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-600 mb-2">
            <span className="text-xs font-medium text-slate-500">Upcoming Exams</span>
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {isLoading ? "—" : (dashboard?.upcomingExamCount ?? 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Scheduled or marking</p>
        </div>

        {/* Card 6: Today's Classes */}
        <div
          onClick={() => onNavigate("calendar")}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-600 mb-2">
            <span className="text-xs font-medium text-slate-500">Today's Classes</span>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {isLoading ? "—" : (dashboard?.todayClassCount ?? 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Classes scheduled today</p>
        </div>
      </div>

      {/* Main 2-Column Split: Left (Schedule & Grading) + Right (Performance & AI Assistant) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Teaching Schedule */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Today's Teaching Schedule</h2>
              </div>
              <button
                onClick={() => onNavigate("calendar")}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Full Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {!isLoading && todayClasses.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400">
                  No classes scheduled today.
                </p>
              )}
              {todayClasses.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="px-2.5 py-1.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-xs font-semibold shrink-0">
                      {item.startTime}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900">
                          {item.title}
                        </span>
                        <StatusBadge status="Scheduled" variant="clean" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Room: <span className="text-slate-700 font-medium">{item.location}</span> ·{" "}
                        <span>{item.description}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onNavigate("attendance")}
                      className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                    >
                      Take Attendance
                    </button>
                    <button
                      onClick={() => onNavigate("curriculum")}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                    >
                      Lesson Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Grading Queue */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">Pending Grading Queue</h2>
              </div>
              <button
                onClick={() => onNavigate("grading-workspace")}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Open Grading Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {pendingGradingAssignments.map((asg) => {
                const pending = asg.totalSubmissions - asg.gradedCount;
                return (
                  <div
                    key={asg.submissionId}
                    className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-600">
                          [{asg.courseCode}]
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-slate-900">
                          {asg.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Due {asg.dueDate}</span>
                        <span>·</span>
                        <span className="text-slate-700">
                          <strong className="text-indigo-600 tabular-nums">
                            {asg.gradedCount}
                          </strong>{" "}
                          / {asg.totalSubmissions} graded
                        </span>
                        <span>·</span>
                        <span className="text-amber-700 font-medium">{pending} waiting review</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onGradeAssignment(asg.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Grade Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Courses Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">My Active Courses</h2>
              <button
                onClick={() => onNavigate("courses")}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                View All Courses
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {course.code}
                      </span>
                      <StatusBadge status={course.status} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="tabular-nums font-medium text-slate-700">
                        {course.enrolledCount} students
                      </span>
                      <span>·</span>
                      <span className="tabular-nums font-mono">Avg {course.averageGrade}%</span>
                    </div>

                    <button
                      onClick={() => onNavigate("courses")}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Manage →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col on lg) */}
        <div className="space-y-6">
          {/* Mentify AI Assistant Quick Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                </div>
                <span className="text-xs font-semibold tracking-wider uppercase text-indigo-300">
                  Mentify AI Assistant
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Make teaching easier with AI</h3>
              <p className="text-xs text-indigo-200/80 mt-1">
                Draft exam rubrics, create quiz questions, or summarize lecture notes in seconds.
              </p>

              {/* Quick AI Prompts */}
              <div className="mt-4 space-y-1.5">
                {[
                  "Draft 5 quiz questions for CS-201 AVL Trees",
                  "Generate rubric for Distributed Systems Milestone",
                  "Summarize student performance for CS-420",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onOpenAIWithPrompt(prompt)}
                    className="w-full text-left text-xs p-2 rounded-lg bg-white/10 hover:bg-white/15 text-indigo-100 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{prompt}</span>
                    <ArrowRight className="w-3 h-3 text-indigo-300 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-800/60 flex items-center justify-between">
                <button
                  onClick={() => onNavigate("ai-assistant")}
                  className="text-xs font-medium text-indigo-300 hover:text-white flex items-center gap-1"
                >
                  <span>Open Full AI Studio</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-indigo-400 font-mono">Gemini 2.5 Flash</span>
              </div>
            </div>
          </div>

          {/* Student Performance Overview */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Course Performance Index
              </h3>
              <button
                onClick={() => onNavigate("analytics")}
                className="text-xs text-indigo-600 hover:underline"
              >
                Analytics
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { code: "CS-201", name: "Algorithms", avg: 84.6, color: "bg-indigo-600" },
                { code: "CS-350", name: "Web Systems", avg: 88.2, color: "bg-violet-600" },
                { code: "CS-420", name: "AI & ML", avg: 81.4, color: "bg-emerald-600" },
              ].map((c) => (
                <div key={c.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {c.code} <span className="text-slate-400 font-normal">· {c.name}</span>
                    </span>
                    <span className="font-mono tabular-nums font-bold text-slate-900">
                      {c.avg.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.color}`}
                      style={{ width: `${c.avg}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Overall Passing Rate:</span>
              <span className="font-bold text-emerald-600 font-mono">92.4%</span>
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Activity
              </h3>
              <button
                onClick={() => onNavigate("notifications")}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                All
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {notificationsLoading ? (
                <p className="text-xs text-slate-400">Loading recent activity...</p>
              ) : recentNotifications.length === 0 ? (
                <p className="text-xs text-slate-400">No recent notifications.</p>
              ) : (
                recentNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => notif.actionUrl && onNavigate(notif.actionUrl)}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg p-1.5 text-xs transition-colors hover:bg-slate-50"
                  >
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                    <div>
                      <p className="font-semibold text-slate-900">{notif.title}</p>
                      <p className="line-clamp-1 text-[11px] text-slate-500">{notif.message}</p>
                      <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

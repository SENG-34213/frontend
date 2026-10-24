import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileCheck,
  GraduationCap,
  Layers3,
  PieChart,
  Sparkles,
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

const percent = (value: number) => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
const formatTime = (value?: string | null) =>
  value ? new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—";
const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not available";

const MetricTile = ({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  value: number | string;
  detail: string;
  icon: React.ElementType;
  tone: "indigo" | "cyan" | "amber" | "violet" | "emerald";
  onClick: () => void;
}) => {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  };
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ring-4 ${tones[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-500" />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
    </button>
  );
};

const CourseWorkloadChart = ({
  courses,
}: {
  courses: TeacherDashboardData["coursePerformance"];
}) => {
  const visible = courses.slice(0, 6);
  const max = Math.max(1, ...visible.map((course) => course.studentCount));
  if (!visible.length)
    return (
      <div className="flex h-72 items-center justify-center text-xs text-slate-400">
        No course data available yet.
      </div>
    );
  const chartWidth = 720;
  const baseline = 204;
  const slot = chartWidth / visible.length;
  const barWidth = Math.min(34, slot * 0.24);
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 720 260"
        className="h-72 min-w-[620px] w-full"
        role="img"
        aria-label="Course student enrollment chart"
      >
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = baseline - (tick / 100) * 166;
          return (
            <g key={tick}>
              <line x1="40" x2="700" y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="3 5" />
              <text x="4" y={y + 4} fill="#94a3b8" fontSize="10">
                {tick}%
              </text>
            </g>
          );
        })}
        {visible.map((course, index) => {
          const center = 62 + index * slot;
          const enrollmentHeight = Math.max(5, (course.studentCount / max) * 166);
          const gradingHeight = Math.max(5, (percent(course.gradingRate) / 100) * 166);
          const enrollmentY = baseline - enrollmentHeight;
          const gradingY = baseline - gradingHeight;
          return (
            <g key={course.courseId}>
              <rect
                x={center - barWidth - 3}
                y={enrollmentY}
                width={barWidth}
                height={enrollmentHeight}
                rx="7"
                fill="#6366f1"
              />
              <rect
                x={center + 3}
                y={gradingY}
                width={barWidth}
                height={gradingHeight}
                rx="7"
                fill="#10b981"
              />
              <text
                x={center - 2}
                y={Math.min(enrollmentY, gradingY) - 8}
                textAnchor="middle"
                fill="#334155"
                fontSize="10"
                fontWeight="700"
              >
                {course.studentCount}
              </text>
              <text
                x={center}
                y="224"
                textAnchor="middle"
                fill="#475569"
                fontSize="10"
                fontWeight="600"
              >
                {course.courseName.length > 13
                  ? `${course.courseName.slice(0, 12)}…`
                  : course.courseName}
              </text>
              <text x={center} y="242" textAnchor="middle" fill="#94a3b8" fontSize="9">
                {course.gradingRate}% reviewed
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const ReviewDonut = ({ reviewed, waiting }: { reviewed: number; waiting: number }) => {
  const total = reviewed + waiting;
  const progress = total ? Math.round((reviewed / total) * 100) : 0;
  return (
    <div
      className="relative h-40 w-40 shrink-0 rounded-full"
      style={{ background: `conic-gradient(#10b981 0 ${progress}%, #f59e0b ${progress}% 100%)` }}
    >
      <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{progress}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          reviewed
        </span>
      </div>
    </div>
  );
};

const SubmissionChart = ({ courses }: { courses: TeacherDashboardData["coursePerformance"] }) => {
  const visible = courses.slice(0, 5);
  const max = Math.max(1, ...visible.map((course) => course.submissionCount));
  if (!visible.length)
    return <p className="py-8 text-xs text-slate-400">No submission activity yet.</p>;
  return (
    <div className="space-y-4">
      {visible.map((course) => {
        const graded = Math.min(course.submissionCount, course.gradedSubmissionCount);
        return (
          <div key={course.courseId}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="max-w-[180px] truncate font-semibold text-slate-700">
                {course.courseName}
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                {graded}/{course.submissionCount}
              </span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
              <span className="bg-emerald-500" style={{ width: `${(graded / max) * 100}%` }} />
              <span
                className="bg-amber-400"
                style={{ width: `${((course.submissionCount - graded) / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-emerald-500" />
          Reviewed
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-amber-400" />
          Waiting
        </span>
      </div>
    </div>
  );
};

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
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    [],
  );
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
  const performanceCourses = dashboard?.coursePerformance ?? [];
  const todayClasses = (dashboard?.todaySchedule ?? []).filter(
    (event) => event.eventType.toUpperCase() === "CLASS",
  );
  const pendingAssignments = dashboard?.pendingGrading ?? [];
  const totalSubmissions = performanceCourses.reduce(
    (sum, course) => sum + course.submissionCount,
    0,
  );
  const gradedSubmissions = performanceCourses.reduce(
    (sum, course) => sum + course.gradedSubmissionCount,
    0,
  );
  const waitingSubmissions = Math.max(0, totalSubmissions - gradedSubmissions);
  const averageReview = performanceCourses.length
    ? Math.round(
        performanceCourses.reduce((sum, course) => sum + course.gradingRate, 0) /
          performanceCourses.length,
      )
    : 0;
  const activeAssignmentTotal = performanceCourses.reduce(
    (sum, course) => sum + course.activeAssignmentCount,
    0,
  );
  const strongestCourse = useMemo(
    () => [...performanceCourses].sort((a, b) => b.gradingRate - a.gradingRate)[0],
    [performanceCourses],
  );

  return (
    <main className="mx-auto max-w-[1480px] space-y-6 pb-12">
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span>{error.message}</span>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Retry
          </button>
        </div>
      )}
      <section className="relative overflow-hidden rounded-[30px] bg-[#111827] px-6 py-7 text-white shadow-2xl shadow-slate-300/30 sm:px-9 sm:py-9">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Teacher command center
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Good morning, {firstName}.
            </h1>
            <p className="mt-3 text-sm font-medium text-cyan-100">{todayLabel}</p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
              A clear view of your classes, review queue, and course activity. Focus on the areas
              that need your attention today.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              onClick={() => onNavigate("attendance")}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-900 transition hover:bg-cyan-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Attendance
            </button>
            <button
              onClick={() => onNavigate("grading-workspace")}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              <ClipboardList className="h-4 w-4" />
              Review queue
            </button>
          </div>
        </div>
        <div className="relative mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
          <div className="bg-white/[0.06] p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Today</p>
            <p className="mt-1 text-2xl font-bold">{dashboard?.todayClassCount ?? 0}</p>
            <p className="text-[11px] text-slate-400">classes scheduled</p>
          </div>
          <div className="bg-white/[0.06] p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Students</p>
            <p className="mt-1 text-2xl font-bold">{dashboard?.studentCount ?? 0}</p>
            <p className="text-[11px] text-slate-400">currently enrolled</p>
          </div>
          <div className="bg-white/[0.06] p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Review rate</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">{averageReview}%</p>
            <p className="text-[11px] text-slate-400">across courses</p>
          </div>
          <div className="bg-white/[0.06] p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Needs action</p>
            <p className="mt-1 text-2xl font-bold text-amber-300">
              {dashboard?.pendingReviewCount ?? waitingSubmissions}
            </p>
            <p className="text-[11px] text-slate-400">submissions waiting</p>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <MetricTile
          label="My courses"
          value={isLoading ? "—" : (dashboard?.courseCount ?? 0)}
          detail="Assigned courses"
          icon={BookOpen}
          tone="indigo"
          onClick={() => onNavigate("courses")}
        />
        <MetricTile
          label="Active work"
          value={isLoading ? "—" : activeAssignmentTotal}
          detail="Published assignments"
          icon={Layers3}
          tone="cyan"
          onClick={() => onNavigate("assignments")}
        />
        <MetricTile
          label="Exams"
          value={isLoading ? "—" : (dashboard?.upcomingExamCount ?? 0)}
          detail="Upcoming assessments"
          icon={GraduationCap}
          tone="violet"
          onClick={() => onNavigate("exams")}
        />
        <MetricTile
          label="Review queue"
          value={isLoading ? "—" : (dashboard?.pendingReviewCount ?? 0)}
          detail="Awaiting your review"
          icon={ClipboardList}
          tone="amber"
          onClick={() => onNavigate("grading-workspace")}
        />
        <MetricTile
          label="Total submissions"
          value={isLoading ? "—" : totalSubmissions}
          detail="Across your courses"
          icon={FileCheck}
          tone="emerald"
          onClick={() => onNavigate("analytics")}
        />
      </section>
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600">
                <Activity className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                  Course analytics
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                Workload by course
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Enrollment scale and review progress in one view.
              </p>
            </div>
            <button
              onClick={() => onNavigate("analytics")}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              Details <ArrowRight className="ml-1 inline h-3 w-3" />
            </button>
          </div>
          <div className="mt-5 flex items-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-indigo-500" />
              Students
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-emerald-500" />
              Reviewed
            </span>
            <span className="ml-auto text-slate-400">Top 6 courses</span>
          </div>
          <div className="mt-2">
            <CourseWorkloadChart courses={performanceCourses} />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-600">
                <PieChart className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                  Submission health
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                Review progress
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
              Live
            </span>
          </div>
          <div className="mt-7 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ReviewDonut reviewed={gradedSubmissions} waiting={waitingSubmissions} />
            <div className="w-full space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Reviewed</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">{gradedSubmissions}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Waiting</p>
                <p className="mt-1 text-2xl font-bold text-amber-500">{waitingSubmissions}</p>
              </div>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] text-slate-400">Best reviewed course</p>
              <p className="mt-1 truncate text-xs font-bold text-slate-800">
                {strongestCourse?.courseName ?? "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3">
              <p className="text-[10px] text-indigo-500">Review rate</p>
              <p className="mt-1 text-lg font-bold text-indigo-700">{averageReview}%</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("grading-workspace")}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Open review workspace <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Submission breakdown</h2>
              <p className="mt-1 text-xs text-slate-500">
                Reviewed and waiting submissions by course.
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-300" />
          </div>
          <div className="mt-5">
            <SubmissionChart courses={performanceCourses} />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Today’s rhythm</h2>
              <p className="mt-1 text-xs text-slate-500">Your scheduled teaching blocks.</p>
            </div>
            <button
              onClick={() => onNavigate("calendar")}
              className="text-xs font-semibold text-indigo-600"
            >
              Calendar →
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {todayClasses.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No classes scheduled today.</p>
            ) : (
              todayClasses.slice(0, 4).map((event) => (
                <div key={event.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <Clock3 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">{event.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {formatTime(event.startDateTime)} · {event.location || "Location not set"}
                    </p>
                  </div>
                  <StatusBadge status="Scheduled" variant="clean" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Needs your attention</h2>
              <p className="mt-1 text-xs text-slate-500">Submissions waiting for grading.</p>
            </div>
            <button
              onClick={() => onNavigate("grading-workspace")}
              className="text-xs font-semibold text-indigo-600"
            >
              View queue →
            </button>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {pendingAssignments.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                Your grading queue is clear.
              </p>
            ) : (
              pendingAssignments.slice(0, 4).map((item) => (
                <div
                  key={item.submissionId}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {item.assignmentTitle}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Submitted {formatDateTime(item.submittedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => onGradeAssignment(item.assignmentId)}
                    className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Grade <ArrowRight className="ml-1 inline h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950 p-6 text-white shadow-xl">
          <Sparkles className="absolute -right-4 -top-4 h-28 w-28 text-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 text-indigo-200">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]">TiT AI</span>
            </div>
            <h2 className="mt-4 text-xl font-bold">Turn course data into your next move.</h2>
            <p className="mt-2 text-xs leading-5 text-indigo-100/80">
              Generate focused teaching actions using the performance data already on your
              dashboard.
            </p>
            <div className="mt-5 space-y-2">
              {performanceCourses.slice(0, 2).map((course) => (
                <button
                  key={course.courseId}
                  onClick={() =>
                    onOpenAIWithPrompt(
                      `Review ${course.courseName} student performance and suggest next teaching actions`,
                    )
                  }
                  className="flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-2.5 text-left text-[11px] text-indigo-50 hover:bg-white/15"
                >
                  <span className="truncate">Analyze {course.courseName}</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                </button>
              ))}
            </div>
            <button
              onClick={() => onNavigate("ai-assistant")}
              className="mt-5 text-xs font-semibold text-white"
            >
              Open AI studio <ArrowRight className="ml-1 inline h-3 w-3" />
            </button>
          </div>
        </div>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent activity</h2>
            <p className="mt-1 text-xs text-slate-500">
              The latest updates from your teaching workspace.
            </p>
          </div>
          <button
            onClick={() => onNavigate("notifications")}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600"
          >
            View all →
          </button>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {notificationsLoading ? (
            <p className="text-xs text-slate-400">Loading recent activity…</p>
          ) : recentNotifications.length === 0 ? (
            <p className="text-xs text-slate-400">No recent notifications.</p>
          ) : (
            recentNotifications.slice(0, 6).map((notification) => (
              <div
                key={notification.id}
                onClick={() => notification.actionUrl && onNavigate(notification.actionUrl)}
                className="flex cursor-pointer items-start gap-3 rounded-2xl p-3 transition hover:bg-slate-50"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {notification.title}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-slate-500">{notification.message}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{notification.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

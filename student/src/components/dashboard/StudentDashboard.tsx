import React, { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  GraduationCap,
  MessageSquare,
  PlayCircle,
  RefreshCw,
  Target,
  TrendingUp,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

const clamp = (value: number) => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
const boundedPercentage = (value: unknown): number | null => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? clamp(numericValue) : null;
};
const normalizePercentage = (score: unknown, maxScore = 100): number | null => {
  const numericScore = Number(score);
  const numericMaxScore = Number(maxScore);
  if (!Number.isFinite(numericScore) || !Number.isFinite(numericMaxScore) || numericMaxScore <= 0) {
    return null;
  }
  return clamp((numericScore / numericMaxScore) * 100);
};
const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const timeLabel = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const Ring = ({
  value,
  color = "#6366f1",
  size = 148,
}: {
  value: number;
  color?: string;
  size?: number;
}) => (
  <div
    className="relative shrink-0 rounded-full"
    style={{
      width: size,
      height: size,
      background: `conic-gradient(${color} 0 ${clamp(value)}%, #e2e8f0 ${clamp(value)}% 100%)`,
    }}
  >
    <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white shadow-inner dark:bg-slate-900">
      <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {Math.round(value)}%
      </span>
      <span className="text-[10px] uppercase tracking-wider text-slate-400">complete</span>
    </div>
  </div>
);

const Stat = ({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
  tone: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
  >
    <div className="flex items-start justify-between">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-500" />
    </div>
    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
      {value}
    </p>
    <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
  </button>
);

export const StudentDashboard: React.FC = () => {
  const {
    profile,
    courses,
    assignments,
    quizzes,
    examinations,
    calendarEvents,
    navigateToCourseWorkspace,
    setSelectedAssignmentId,
    setCurrentView,
    attendanceSummaries,
    attendanceOverall,
    workspaceLoading,
    workspaceError,
    retryWorkspace,
  } = useStudent();
  const enrolledCourses = courses.filter((course) => course.enrolled);
  const pendingAssignments = assignments.filter((assignment) => assignment.status === "PENDING");
  const upcomingExams = examinations.filter((exam) => exam.status === "UPCOMING");
  const availableQuizzes = quizzes.filter((quiz) => quiz.status === "AVAILABLE");
  const completedLessons = enrolledCourses.reduce(
    (sum, course) =>
      sum +
      course.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.completed)
        .length,
    0,
  );
  const averageProgress = enrolledCourses.length
    ? Math.round(
        enrolledCourses.reduce((sum, course) => sum + course.progressPercentage, 0) /
          enrolledCourses.length,
      )
    : 0;
  const creditProgress = profile.totalCreditsRequired
    ? clamp((profile.creditsCompleted / profile.totalCreditsRequired) * 100)
    : 0;
  const assessmentPerformance = useMemo(() => {
    const assignmentScores = assignments
      .filter((assignment) => assignment.status === "GRADED" && assignment.grade != null)
      .flatMap((assignment) => {
        const percentage = normalizePercentage(assignment.grade, assignment.maxScore);
        return percentage == null ? [] : [percentage];
      });
    const quizScores = quizzes
      .filter((quiz) => quiz.status === "COMPLETED" && quiz.lastScorePercentage != null)
      .flatMap((quiz) => {
        const percentage = normalizePercentage(quiz.lastScorePercentage);
        return percentage == null ? [] : [percentage];
      });
    const examScores = examinations
      .filter((exam) => exam.status === "COMPLETED" && exam.scorePercentage != null)
      .flatMap((exam) => {
        const percentage = normalizePercentage(exam.scorePercentage);
        return percentage == null ? [] : [percentage];
      });
    const average = (scores: number[]) =>
      scores.length ? scores.reduce((total, score) => total + score, 0) / scores.length : null;

    return [
      { label: "Assignments", average: average(assignmentScores), count: assignmentScores.length },
      { label: "Quizzes", average: average(quizScores), count: quizScores.length },
      { label: "Exams", average: average(examScores), count: examScores.length },
    ];
  }, [assignments, examinations, quizzes]);
  const deadlines = useMemo(
    () =>
      [
        ...pendingAssignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          course: assignment.courseCode || assignment.courseTitle,
          type: "Assignment",
          due: assignment.dueDate,
          priority: assignment.priority,
          action: () => {
            setSelectedAssignmentId(assignment.id);
            setCurrentView("assignment-details");
          },
        })),
        ...availableQuizzes.map((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          course: quiz.courseCode || quiz.courseTitle,
          type: "Quiz",
          due: quiz.dueDate,
          priority: "MEDIUM" as const,
          action: () => setCurrentView("quizzes"),
        })),
      ]
        .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
        .slice(0, 5),
    [availableQuizzes, pendingAssignments, setCurrentView, setSelectedAssignmentId],
  );
  const firstCourse = enrolledCourses[0];
  const firstName = profile.name.split(" ")[0] || "Student";

  return (
    <div className="space-y-6 pb-12">
      {workspaceError && (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Live learning data could not be refreshed. Existing records may be incomplete.
          </span>
          <button
            type="button"
            onClick={() => void retryWorkspace()}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}
      {workspaceLoading && (
        <div className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-200">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Refreshing your live learning analytics…
        </div>
      )}
      <section className="relative overflow-hidden rounded-[30px] bg-[#111827] p-6 text-white shadow-2xl shadow-slate-300/30 sm:p-9">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Student learning hub
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Good morning, {firstName}.
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Your learning progress, priorities, and academic rhythm in one focused view.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => firstCourse && navigateToCourseWorkspace(firstCourse.id)}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-900 hover:bg-cyan-50"
              >
                <PlayCircle className="h-4 w-4 text-indigo-600" />
                {firstCourse ? `Resume ${firstCourse.code}` : "Explore courses"}
              </button>
              <button
                onClick={() => setCurrentView("calendar")}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-semibold text-white hover:bg-white/15"
              >
                <CalendarDays className="h-4 w-4" />
                View schedule
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
            <div className="bg-white/[0.06] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Semester</p>
              <p className="mt-1 max-w-[100px] truncate text-sm font-bold">
                {profile.semester || "Current"}
              </p>
            </div>
            <div className="bg-white/[0.06] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Degree progress</p>
              <p className="mt-1 text-sm font-bold text-cyan-300">{Math.round(creditProgress)}%</p>
            </div>
            <div className="bg-white/[0.06] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Current GPA</p>
              <p className="mt-1 text-sm font-bold text-emerald-300">
                {profile.currentGpa ? profile.currentGpa.toFixed(2) : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat
          label="Courses"
          value={enrolledCourses.length}
          detail="Active enrollment"
          icon={BookOpen}
          tone="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"
          onClick={() => setCurrentView("my-courses")}
        />
        <Stat
          label="Progress"
          value={`${averageProgress}%`}
          detail="Average course progress"
          icon={Target}
          tone="bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300"
          onClick={() => setCurrentView("my-courses")}
        />
        <Stat
          label="Assignments"
          value={pendingAssignments.length}
          detail="Waiting to submit"
          icon={FileCheck2}
          tone="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300"
          onClick={() => setCurrentView("assignments")}
        />
        <Stat
          label="Quizzes"
          value={availableQuizzes.length}
          detail="Ready to attempt"
          icon={Activity}
          tone="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300"
          onClick={() => setCurrentView("quizzes")}
        />
        <Stat
          label="Exams"
          value={upcomingExams.length}
          detail="Upcoming assessments"
          icon={GraduationCap}
          tone="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300"
          onClick={() => setCurrentView("examinations")}
        />
        <Stat
          label="Lessons"
          value={completedLessons}
          detail="Completed lessons"
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
          onClick={() => setCurrentView("my-courses")}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-indigo-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                  Learning analytics
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Course progress map
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                See where your learning momentum is building.
              </p>
            </div>
            <button
              onClick={() => setCurrentView("my-courses")}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300"
            >
              All courses <ArrowRight className="ml-1 inline h-3 w-3" />
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {enrolledCourses.length === 0 ? (
              <p className="py-10 text-center text-xs text-slate-400">No active courses found.</p>
            ) : (
              enrolledCourses.slice(0, 6).map((course) => (
                <div key={course.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                        {course.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {course.code} · {course.instructor.name || "Instructor not assigned"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-indigo-600">
                      {course.progressPercentage}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
                      style={{ width: `${clamp(course.progressPercentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-emerald-600">
                <Award className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                  Academic health
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Your snapshot
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Live data
            </span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 sm:justify-start">
            <Ring value={creditProgress} color="#06b6d4" />
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Credits completed
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {profile.creditsCompleted || 0}
                  <span className="ml-1 text-sm font-medium text-slate-400">
                    / {profile.totalCreditsRequired || "—"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Attendance</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {attendanceOverall
                    ? boundedPercentage(attendanceOverall.attendancePercentage) == null
                      ? "—"
                      : `${boundedPercentage(attendanceOverall.attendancePercentage)!.toFixed(1)}%`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentView("grades")}
            className="mt-6 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300"
          >
            View academic records <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-600">
              <BarChart3 className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                Assessment performance
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Results by assessment type
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Averages calculated from your completed and graded learning records.
            </p>
          </div>
          <button
            onClick={() => setCurrentView("grades")}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300"
          >
            Academic records <ChevronRight className="ml-1 inline h-3 w-3" />
          </button>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {assessmentPerformance.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {item.label}
                </span>
                <span className="text-xs font-bold tabular-nums text-indigo-600">
                  {item.average == null ? "—" : `${item.average.toFixed(1)}%`}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
                  style={{ width: `${clamp(item.average ?? 0)}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                {item.count === 0
                  ? "No completed results yet"
                  : `${item.count} completed result${item.count === 1 ? "" : "s"}`}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Priority lane</h2>
              <p className="mt-1 text-xs text-slate-500">
                Your next academic actions, ordered by due date.
              </p>
            </div>
            <button
              onClick={() => setCurrentView("assignments")}
              className="text-xs font-semibold text-indigo-600"
            >
              View all →
            </button>
          </div>
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {deadlines.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">You are all caught up.</p>
            ) : (
              deadlines.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {item.type}
                      </span>
                      <span className="truncate text-[11px] text-slate-400">{item.course}</span>
                      {item.priority === "HIGH" && (
                        <span className="text-[10px] font-bold text-rose-500">High</span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                      {item.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock3 className="h-3 w-3" />
                      Due {dateLabel(item.due)} · {timeLabel(item.due)}
                    </p>
                  </div>
                  <button
                    onClick={item.action}
                    className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Open
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Attendance health
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Course-level attendance from the attendance service.
              </p>
            </div>
            <button
              onClick={() => setCurrentView("calendar")}
              className="text-xs font-semibold text-indigo-600"
            >
              Details →
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {attendanceSummaries.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No attendance records yet.</p>
            ) : (
              attendanceSummaries.slice(0, 4).map((summary) => {
                const course = courses.find((item) => item.id === summary.courseId);
                const attendancePercentage = boundedPercentage(summary.attendancePercentage);
                return (
                  <div key={summary.courseId}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="max-w-[190px] truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {course?.title || "Course"}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        {attendancePercentage == null ? "—" : `${attendancePercentage.toFixed(1)}%`}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${attendancePercentage != null && attendancePercentage < 75 ? "bg-amber-400" : "bg-emerald-500"}`}
                        style={{ width: `${attendancePercentage ?? 0}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {summary.attendedCount} attended · {summary.absentCount} absent
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming schedule
              </h2>
              <p className="mt-1 text-xs text-slate-500">Your next calendar events.</p>
            </div>
            <button
              onClick={() => setCurrentView("calendar")}
              className="text-xs font-semibold text-indigo-600"
            >
              Calendar →
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {calendarEvents.slice(0, 4).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60"
              >
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <span className="text-[9px] font-bold uppercase">
                    {new Date(event.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="text-sm font-bold">{new Date(event.date).getDate()}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                    {event.title}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-slate-500">
                    {event.startTime} · {event.location || "Location not set"}
                  </p>
                </div>
              </div>
            ))}
            {calendarEvents.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-400">No upcoming events.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quick access</h2>
            <p className="mt-1 text-xs text-slate-500">Jump directly to the tools you use most.</p>
          </div>
          <MessageSquare className="h-5 w-5 text-slate-300" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() => setCurrentView("grades")}
            className="rounded-2xl border border-slate-200 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/40"
          >
            <Award className="h-5 w-5 text-violet-500" />
            <p className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-100">View grades</p>
            <p className="mt-1 text-[10px] text-slate-500">Academic results</p>
          </button>
          <button
            onClick={() => setCurrentView("messages")}
            className="rounded-2xl border border-slate-200 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/40"
          >
            <MessageSquare className="h-5 w-5 text-cyan-500" />
            <p className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-100">Messages</p>
            <p className="mt-1 text-[10px] text-slate-500">Talk to instructors</p>
          </button>
          <button
            onClick={() => setCurrentView("quizzes")}
            className="rounded-2xl border border-slate-200 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/40"
          >
            <Target className="h-5 w-5 text-amber-500" />
            <p className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-100">
              Practice quizzes
            </p>
            <p className="mt-1 text-[10px] text-slate-500">Build confidence</p>
          </button>
          <button
            onClick={() => setCurrentView("materials")}
            className="rounded-2xl border border-slate-200 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/40"
          >
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <p className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-100">
              Study materials
            </p>
            <p className="mt-1 text-[10px] text-slate-500">Course resources</p>
          </button>
        </div>
      </section>
    </div>
  );
};

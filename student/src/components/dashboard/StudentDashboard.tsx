import React from "react";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Calendar,
  ChevronRight,
  PlayCircle,
  FileCheck2,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const StudentDashboard: React.FC = () => {
  const {
    profile,
    courses,
    assignments,
    quizzes,
    examinations,
    calendarEvents,
    navigateToCourseWorkspace,
    navigateToCourseDetails,
    setSelectedAssignmentId,
    setCurrentView,
    sendAiQuery,
    attendanceSummaries,
    attendanceOverall,
  } = useStudent();

  // Summary counts
  const enrolledCourses = courses.filter((c) => c.enrolled);
  const inProgressCourses = enrolledCourses.filter(
    (c) => c.progressPercentage > 0 && c.progressPercentage < 100,
  );
  const pendingAssignments = assignments.filter((a) => a.status === "PENDING");
  const upcomingExams = examinations.filter((e) => e.status === "UPCOMING");
  const completedLessonsCount = enrolledCourses.reduce((acc, c) => {
    const completed = c.modules.flatMap((m) => m.lessons).filter((l) => l.completed).length;
    return acc + completed;
  }, 0);

  // Active courses for Continue Learning
  const continueCourses = enrolledCourses.slice(0, 3);

  // Upcoming deadlines (merged assignments and quizzes)
  const deadlines = [
    ...pendingAssignments.map((a) => ({
      id: a.id,
      title: a.title,
      courseCode: a.courseCode,
      courseTitle: a.courseTitle,
      type: "Assignment" as const,
      dueDate: new Date(a.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      priority: a.priority,
      action: () => {
        setSelectedAssignmentId(a.id);
        setCurrentView("assignment-details");
      },
    })),
    ...quizzes
      .filter((q) => q.status === "AVAILABLE")
      .map((q) => ({
        id: q.id,
        title: q.title,
        courseCode: q.courseCode,
        courseTitle: q.courseTitle,
        type: "Quiz" as const,
        dueDate: new Date(q.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        priority: "MEDIUM" as const,
        action: () => setCurrentView("quizzes"),
      })),
  ];

  const recentActivity = [
    ...assignments
      .filter((assignment) => assignment.submittedDate)
      .map((assignment) => ({
        id: `assignment-${assignment.id}`,
        title: "Assignment Submitted",
        detail: `${assignment.courseCode || assignment.courseTitle}: ${assignment.title}`,
        date: assignment.submittedDate || "",
        icon: "assignment" as const,
      })),
    ...assignments
      .filter((assignment) => assignment.status === "GRADED" && assignment.grade !== undefined)
      .map((assignment) => ({
        id: `grade-${assignment.id}`,
        title: "Assignment Graded",
        detail: `${assignment.courseCode || assignment.courseTitle}: ${assignment.title}`,
        date: assignment.submittedDate || "",
        icon: "grade" as const,
      })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-sm dark:border-indigo-950 sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2 max-w-xl">
            <div className="hidden">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <span>{profile.semester || "Current semester"}</span>
              {profile.totalCreditsRequired > 0 && (
                <>
                  <span className="text-indigo-400">·</span>
                  <span>
                    Degree Progress:{" "}
                    {Math.round((profile.creditsCompleted / profile.totalCreditsRequired) * 100)}%
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <span>{profile.semester || "Current semester"}</span>
              {profile.totalCreditsRequired > 0 && (
                <>
                  <span className="text-indigo-400">·</span>
                  <span>
                    Degree Progress:{" "}
                    {Math.round((profile.creditsCompleted / profile.totalCreditsRequired) * 100)}%
                  </span>
                </>
              )}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Good morning, {profile.name.split(" ")[0]}!
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              Ready to make progress on your learning journey? You have{" "}
              <span className="font-semibold text-white">
                {pendingAssignments.length} assignments
              </span>{" "}
              due this week and{" "}
              <span className="font-semibold text-white">
                {upcomingExams.length} upcoming exam{upcomingExams.length === 1 ? "" : "s"}
              </span>
              .
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const firstActive = continueCourses[0];
                  if (firstActive) navigateToCourseWorkspace(firstActive.id);
                }}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-indigo-900 shadow-sm hover:bg-indigo-50 transition-colors"
              >
                <PlayCircle className="h-4 w-4 text-indigo-600" />
                <span>Resume {continueCourses[0]?.code || "Course"}</span>
              </button>
              <button
                onClick={() => setCurrentView("calendar")}
                className="flex items-center gap-2 rounded-lg border border-indigo-700/60 bg-indigo-800/40 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-800/80 transition-colors"
              >
                <Calendar className="h-4 w-4 text-indigo-300" />
                <span>View Schedule</span>
              </button>
            </div>
          </div>

          {/* Educational SVG Graphic */}
          <div className="hidden lg:flex items-center justify-center shrink-0 pr-4">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-2xl bg-indigo-700/30 border border-indigo-500/20 backdrop-blur-xs">
              <GraduationCap className="h-16 w-16 text-indigo-200" />
              <div className="absolute -bottom-2 -right-2 rounded-full bg-emerald-500 p-1.5 text-white shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Enrolled</span>
            <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {enrolledCourses.length}
            </span>
            <span className="text-[11px] text-slate-500">courses</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Active semester</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">In Progress</span>
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {inProgressCourses.length}
            </span>
            <span className="text-[11px] text-slate-500">active</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Regular sessions</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Assignments</span>
            <FileCheck2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {pendingAssignments.length}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              pending
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Due within 7 days</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Upcoming Exams</span>
            <Award className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {upcomingExams.length}
            </span>
            <span className="text-[11px] text-slate-500">scheduled</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {upcomingExams.length ? "Scheduled exams" : "No scheduled exams"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Lessons</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {completedLessonsCount}
            </span>
            <span className="text-[11px] text-slate-500">done</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            From your course progress
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Attendance</span>
            <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {attendanceOverall ? `${attendanceOverall.attendancePercentage.toFixed(1)}%` : "—"}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              overall
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {attendanceOverall
              ? `${attendanceOverall.attendedCount} attended sessions`
              : "No attendance data"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Course Attendance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Attendance summaries reported by the attendance service
            </p>
          </div>
        </div>
        {attendanceSummaries.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">
            No attendance records are available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {attendanceSummaries.map((summary) => {
              const course = courses.find((item) => item.id === summary.courseId);
              return (
                <div
                  key={summary.courseId}
                  className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {course?.code || summary.courseId}
                    </span>
                    <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {summary.attendancePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {summary.attendedCount} attended · {summary.absentCount} absent
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Continue Learning Horizontal Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Continue Learning
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pick up right where you left off in your active coursework
            </p>
          </div>
          <button
            onClick={() => setCurrentView("my-courses")}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            <span>All Courses</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {continueCourses.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {course.code}
                    </span>
                    <h3 className="mt-0.5 font-display text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {course.instructor.name}
                    </p>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {course.progressPercentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${course.progressPercentage}%` }}
                  />
                </div>

                {/* Last accessed lesson */}
                <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Next Up
                  </span>
                  <p className="mt-0.5 text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                    {course.lastAccessedLessonTitle || "No lesson progress recorded"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => navigateToCourseDetails(course.id)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Syllabus
                </button>
                <button
                  onClick={() => navigateToCourseWorkspace(course.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>Resume</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Deadlines & Analytics Split Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Deadlines (2 cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Upcoming Deadlines
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prioritized academic milestones for the next 10 days
              </p>
            </div>
            <button
              onClick={() => setCurrentView("assignments")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View All
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {deadlines.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                No pending deadlines right now!
              </p>
            ) : (
              deadlines.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3.5 gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {item.courseCode}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.type}
                      </span>
                      {item.priority === "HIGH" && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                            High Priority
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="mt-0.5 truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>Due {item.dueDate}</span>
                    </p>
                  </div>
                  <button
                    onClick={item.action}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Open
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Study Activity */}
        <div className="flex flex-col justify-center rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Study Activity
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Study-time analytics are not available for your account yet.
          </p>
        </div>
      </div>

      {/* 5. Mentify AI Assistant Preview Card & Calendar Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Mentify AI Interactive Preview Card */}
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50 p-6 shadow-xs dark:border-indigo-900/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Need help understanding something?
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Mentify AI is contextualized with your course notes, proofs, and assignments.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView("mentify-ai")}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors shrink-0"
            >
              <span>Ask Mentify AI</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Suggested Quick Prompts */}
          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {[
              {
                label: "Help me understand a difficult topic",
              },
              {
                label: "Help me prepare for my next assessment",
              },
              {
                label: "Summarize my current course material",
              },
              {
                label: "Create practice questions for me",
              },
            ].map((prompt) => (
              <button
                key={prompt.label}
                onClick={() => {
                  sendAiQuery(prompt.label);
                  setCurrentView("mentify-ai");
                }}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-indigo-700"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                    {prompt.label}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Preview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Upcoming Schedule
            </h2>
            <button
              onClick={() => setCurrentView("calendar")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Full Calendar
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {calendarEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800/80"
              >
                <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <span className="text-[10px] uppercase">
                    {new Date(event.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="text-xs tabular-nums font-bold">
                    {new Date(event.date).getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {event.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {event.startTime} · {event.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Recent Activity Feed */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">
          Recent Learning Activity
        </h2>
        {recentActivity.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800"
              >
                {activity.icon === "assignment" ? (
                  <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                ) : (
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">{activity.detail}</p>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-xs text-slate-500">
            No recent learning activity is available.
          </p>
        )}
      </div>
    </div>
  );
};

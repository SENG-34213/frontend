import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Award,
  Sparkles,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const EnrollmentsView: React.FC = () => {
  const {
    courses,
    profile,
    navigateToCourseWorkspace,
    navigateToCourseDetails,
    showToast,
    setCurrentView,
  } = useStudent();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED" | "ALL">("ALL");

  const enrolledCourses = courses.filter((c) => c.enrolled);
  const activeEnrollments = enrolledCourses.filter((c) => c.progressPercentage < 100);
  const completedEnrollments = enrolledCourses.filter((c) => c.progressPercentage === 100);

  const displayedCourses =
    activeTab === "ACTIVE"
      ? activeEnrollments
      : activeTab === "COMPLETED"
        ? completedEnrollments
        : enrolledCourses;

  const totalCreditsEarned = enrolledCourses.reduce(
    (acc, c) => acc + (c.progressPercentage === 100 ? c.credits : 0),
    0,
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Academic Enrollments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Institutional registration records, credit completion progress, and official course
            credentials
          </p>
        </div>
        <button
          onClick={() => setCurrentView("explore-courses")}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          <span>Register New Course</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Active Degree</span>
            <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 font-display text-base font-bold text-slate-900 dark:text-white">
            {profile.degreeProgram}
          </p>
          <p className="text-xs text-slate-500">{profile.semester}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Degree Credit Progress</span>
            <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {profile.creditsCompleted}
            </span>
            <span className="text-xs text-slate-500">/ {profile.totalCreditsRequired} credits</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width: `${(profile.creditsCompleted / profile.totalCreditsRequired) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Cumulative GPA</span>
            <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {profile.currentGpa.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Distinction</span>
          </div>
          <p className="text-xs text-slate-500">Academic Standing: Exemplary</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {(["ALL", "ACTIVE", "COMPLETED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2.5 capitalize transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            {tab.toLowerCase()} Enrollments (
            {tab === "ALL"
              ? enrolledCourses.length
              : tab === "ACTIVE"
                ? activeEnrollments.length
                : completedEnrollments.length}
            )
          </button>
        ))}
      </div>

      {/* Enrollments Table / Cards */}
      <div className="space-y-4">
        {displayedCourses.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No enrollments found for this filter.
          </div>
        ) : (
          displayedCourses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${course.bannerColor} font-mono text-xs font-bold text-white shadow-2xs`}
                >
                  {course.code.split(" ")[0]}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {course.code}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{course.credits} Credits</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Status: Active
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Faculty: {course.instructor.name} · {course.schedule}
                  </p>
                </div>
              </div>

              {/* Progress and Actions */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                <div className="w-28 text-right sm:text-left">
                  <div className="flex justify-between text-[11px] mb-1 font-semibold">
                    <span className="text-slate-400">Progress</span>
                    <span className="tabular-nums">{course.progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      showToast(`Official enrollment verification downloaded for ${course.code}`);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    title="Download Official Verification"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    <span className="hidden md:inline">Proof</span>
                  </button>
                  <button
                    onClick={() => navigateToCourseWorkspace(course.id)}
                    className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
                  >
                    Go to Course
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

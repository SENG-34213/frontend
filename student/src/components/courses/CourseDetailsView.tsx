import React, { useState } from "react";
import {
  BookOpen,
  User,
  Clock,
  PlayCircle,
  FileCheck2,
  FolderArchive,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const CourseDetailsView: React.FC = () => {
  const {
    courses,
    selectedCourseId,
    navigateToCourseWorkspace,
    setSelectedAssignmentId,
    setCurrentView,
    assignments,
    materials,
  } = useStudent();

  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "materials" | "assignments" | "grades"
  >("overview");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
  if (!course) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
        Course details are not available yet.
      </div>
    );
  }
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const courseMaterials = materials.filter((m) => m.courseId === course.id);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Course Banner Header */}
      <div
        className={`overflow-hidden rounded-2xl bg-gradient-to-r ${course.bannerColor} p-6 sm:p-8 text-white shadow-md`}
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="rounded bg-black/30 px-2.5 py-0.5 font-bold uppercase backdrop-blur-xs">
                {course.code}
              </span>
              <span>·</span>
              <span className="text-white/80">{course.category}</span>
              <span>·</span>
              <span className="text-white/80">{course.level} Level</span>
              <span>·</span>
              <span className="text-white/80">{course.credits} Credits</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
              {course.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => navigateToCourseWorkspace(course.id)}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-indigo-900 shadow-sm hover:bg-indigo-50 transition-colors"
            >
              <PlayCircle className="h-4 w-4 text-indigo-600" />
              <span>Continue Learning</span>
            </button>
          </div>
        </div>

        {/* Progress Strip */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-white/20 pt-4 text-xs">
          <div className="flex items-center gap-2">
            <span>Overall Curriculum Progress:</span>
            <span className="font-bold tabular-nums">{course.progressPercentage}% Completed</span>
          </div>
          <div className="h-2 w-full sm:w-48 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${course.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {(["overview", "curriculum", "materials", "assignments", "grades"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-3 capitalize transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Course Syllabus & Learning Outcomes
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This rigorous course immerses students into theoretical foundations and
                high-throughput engineering implementations. Upon completion of this course,
                students will be capable of:
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Proving amortized time bounds using potential functions and accounting methods.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Implementing balanced search structures with strict logarithmic height
                    guarantees.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Designing optimal shortest-path and minimum spanning tree algorithms for massive
                    graphs.
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick Curriculum Highlight */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Curriculum Breakdown ({course.modules.length} Modules)
                </h2>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Full Syllabus
                </button>
              </div>
              <div className="space-y-3">
                {course.modules.map((mod, idx) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-xs dark:border-slate-800"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {mod.title}
                      </span>
                      <p className="text-[11px] text-slate-500">{mod.description}</p>
                    </div>
                    <span className="text-slate-400 shrink-0">{mod.lessons.length} lessons</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructor & Logistics Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Course Faculty
              </h2>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  {course.instructor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    {course.instructor.name}
                  </h4>
                  <p className="text-xs text-slate-500">{course.instructor.title}</p>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {course.instructor.department}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{course.instructor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Office Hours: {course.instructor.officeHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>Room: {course.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{course.schedule}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Curriculum Accordion */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          {course.modules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center dark:border-slate-700">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Curriculum syllabus is currently being finalized.
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Modules and lessons will appear here when published by your teacher.
              </p>
            </div>
          ) : (
            course.modules.map((mod, moduleIndex) => {
              const isExpanded = expandedModules[mod.id] ?? false;
              const completedCount = mod.lessons.filter((l) => l.completed).length;
              const moduleNumber = mod.order || moduleIndex + 1;

              return (
                <div
                  key={mod.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="flex w-full items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/70 p-4 text-left transition-colors hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 sm:p-5"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {moduleNumber}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                            Module {moduleNumber}
                          </span>
                          <span className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {mod.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {mod.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400">
                          <span>{mod.lessons.length} lessons</span>
                          <span>·</span>
                          <span>
                            {completedCount}/{mod.lessons.length} completed
                          </span>
                          {mod.startDate && mod.endDate && (
                            <>
                              <span>·</span>
                              <span>
                                {mod.startDate} – {mod.endDate}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`hidden rounded-md px-2 py-1 text-[10px] font-semibold sm:inline-flex ${
                          mod.status === "Draft"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        }`}
                      >
                        {mod.status || "Published"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900/60">
                      {mod.lessons.length === 0 && (
                        <p className="px-6 py-5 text-xs text-slate-400">
                          No lessons published yet.
                        </p>
                      )}
                      {mod.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between gap-4 p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 sm:px-6"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {lesson.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-400">
                                  {moduleNumber}.{lesson.order || lessonIndex + 1}
                                </span>
                                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                                  {lesson.title}
                                </p>
                              </div>
                              <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                                {lesson.description ||
                                  `${lesson.contentType || lesson.type} lesson`}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
                            <span className="hidden font-mono tabular-nums sm:inline">
                              {lesson.durationMinutes} min
                            </span>
                            <span className="hidden rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 md:inline">
                              {lesson.contentType || lesson.type}
                            </span>
                            <button
                              onClick={() => navigateToCourseWorkspace(course.id, lesson.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                            >
                              <span>Launch</span>
                              <PlayCircle className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Materials */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {courseMaterials.map((mat) => (
              <div
                key={mat.id}
                className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                    {mat.type} · {mat.fileSize}
                  </span>
                  <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white">
                    {mat.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">{mat.description}</p>
                </div>
                <button
                  onClick={() => setCurrentView("materials")}
                  className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 shrink-0"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Assignments */}
      {activeTab === "assignments" && (
        <div className="space-y-3">
          {courseAssignments.map((asg) => (
            <div
              key={asg.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs"
            >
              <div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  Due: {new Date(asg.dueDate).toLocaleDateString()}
                </span>
                <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white">
                  {asg.title}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Status: {asg.status} · Points: {asg.maxScore}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedAssignmentId(asg.id);
                  setCurrentView("assignment-details");
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Open Assignment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Grades */}
      {activeTab === "grades" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Academic Performance in {course.code}
            </h3>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              Grade: {course.currentGrade || "Not recorded"}
              {course.currentScorePercentage !== undefined &&
                ` (${course.currentScorePercentage}%)`}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Based on completed homework problem sets, laboratory benchmarks, and quiz assessments.
          </p>
        </div>
      )}
    </div>
  );
};

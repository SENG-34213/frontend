import React, { useState } from "react";
import {
  BookOpen,
  PlayCircle,
  FileText,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  ArrowLeft,
  ArrowUpRight,
  LayoutDashboard,
  ListChecks,
  Library,
  ClipboardList,
  GraduationCap,
  HelpCircle,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { EmptyState } from "../../../../shared/ui/EmptyState";

export const CourseDetailsView: React.FC = () => {
  const {
    courses,
    selectedCourseId,
    navigateToCourseWorkspace,
    setSelectedAssignmentId,
    setCurrentView,
    assignments,
    quizzes,
    setSelectedQuizId,
    materials,
    downloadMaterial,
  } = useStudent();

  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "materials" | "assignments" | "quizzes" | "grades"
  >("overview");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const course = courses.find((c) => c.id === selectedCourseId);
  if (!course) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 dark:border-slate-700 dark:bg-slate-900">
        <EmptyState
          compact
          icon={BookOpen}
          title="Course not found"
          description="The selected course is no longer available in your enrolled courses."
          className="border-0 py-0"
        />
        <button
          type="button"
          onClick={() => setCurrentView("my-courses")}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to My Courses
        </button>
      </div>
    );
  }
  const courseModules = (Array.isArray(course.modules) ? course.modules : [])
    .filter((module) => module && Array.isArray(module.lessons))
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) => lesson && typeof lesson.id === "string"),
    }));
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const courseQuizzes = quizzes.filter((quiz) => quiz.courseId === course.id);
  const courseMaterials = materials.filter((m) => m.courseId === course.id);
  const curriculumLessons = courseModules.flatMap((module) => module.lessons);
  const teachingCompletedLessons = curriculumLessons.filter(
    (lesson) => lesson.teachingCompleted,
  ).length;
  const curriculumProgress = curriculumLessons.length
    ? Math.round((teachingCompletedLessons / curriculumLessons.length) * 100)
    : 0;
  const courseStats = [
    { label: "Modules", value: courseModules.length, icon: Library },
    { label: "Lessons", value: curriculumLessons.length, icon: ListChecks },
    { label: "Materials", value: courseMaterials.length, icon: FileText },
    { label: "Assignments", value: courseAssignments.length, icon: ClipboardList },
    { label: "Quizzes", value: courseQuizzes.length, icon: HelpCircle },
  ];

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900 dark:text-slate-100">
      {/* Course Banner Header */}
      <section
        className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${course.bannerColor} p-5 text-white shadow-xl sm:p-8`}
      >
        <div className="pointer-events-none absolute inset-0 bg-slate-950/5" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-150px] left-1/3 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
        <div className="relative">
          <button
            type="button"
            onClick={() => setCurrentView("my-courses")}
            className="mb-8 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/10 px-3 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Courses
          </button>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                <span className="rounded-lg bg-black/25 px-2.5 py-1 font-mono text-white backdrop-blur-sm">
                  {course.code}
                </span>
                <span>{course.category}</span>
                <span className="text-white/45">•</span>
                <span>{course.level} level</span>
                <span className="text-white/45">•</span>
                <span>{course.credits} credits</span>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {course.title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/80">{course.description}</p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-72">
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/15 p-3 backdrop-blur-sm">
                {course.instructor.avatar ? (
                  <img
                    src={course.instructor.avatar}
                    alt={`${course.instructor.name} profile`}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-white/25"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-bold text-white ring-2 ring-white/15">
                    {course.instructor.name
                      .split(" ")
                      .filter(Boolean)
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "T"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    Course teacher
                  </p>
                  <p className="truncate text-sm font-bold text-white">
                    {course.instructor.name || "Teacher details not found"}
                  </p>
                  <p className="truncate text-[11px] text-white/65">
                    {course.instructor.title ||
                      course.instructor.department ||
                      "Assigned course teacher"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigateToCourseWorkspace(course.id)}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-indigo-900 shadow-lg transition hover:bg-indigo-50"
              >
                <PlayCircle className="h-4 w-4 text-indigo-600" />
                Continue learning
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
          <div className="mt-8 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            {courseStats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-3 backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 text-white/70" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">{label}</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/15 bg-black/10 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-white/75" />
                <span className="text-white/75">Curriculum progress</span>
              </div>
              <span className="font-bold tabular-nums">{curriculumProgress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${curriculumProgress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <nav className="sticky top-2 z-10 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-1.5 text-xs font-semibold shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        {(
          [
            ["overview", "Overview", LayoutDashboard],
            ["curriculum", "Curriculum", BookOpen],
            ["materials", "Materials", FileText],
            ["assignments", "Assignments", ClipboardList],
            ["quizzes", "Quizzes", HelpCircle],
            ["grades", "Grades", Award],
          ] as const
        ).map(([tab, label, Icon]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 transition-all sm:flex-1 sm:justify-center ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </nav>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6">
          {/* Main Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 space-y-4">
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
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Curriculum Breakdown ({courseModules.length} Modules)
                </h2>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Full Syllabus
                </button>
              </div>
              <div className="space-y-3">
                {courseModules.length === 0 ? (
                  <EmptyState
                    compact
                    icon={BookOpen}
                    title="Curriculum not found"
                    description="No curriculum modules or lessons are available for this course yet."
                    className="border-0 bg-transparent dark:bg-transparent"
                  />
                ) : (
                  courseModules.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 text-xs transition-colors hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/30"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {mod.title}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {mod.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-slate-500 dark:text-slate-400">
                        {mod.lessons.length} lessons
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Curriculum Accordion */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          {courseModules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center dark:border-slate-700">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Curriculum not found
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Modules and lessons are not available for this course yet.
              </p>
            </div>
          ) : (
            courseModules.map((mod, moduleIndex) => {
              const isExpanded = expandedModules[mod.id] ?? false;
              const completedCount = mod.lessons.filter((l) => l.teachingCompleted).length;
              const moduleNumber = mod.order || moduleIndex + 1;

              return (
                <div
                  key={mod.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900"
                >
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="flex w-full items-center justify-between gap-4 border-b border-slate-200/80 bg-slate-50 p-4 text-left transition-colors hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 sm:p-5"
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
                            {completedCount}/{mod.lessons.length} taught
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
                    <div className="divide-y divide-slate-200/70 bg-white dark:divide-slate-800 dark:bg-slate-900/60">
                      {mod.lessons.length === 0 && (
                        <EmptyState
                          compact
                          icon={BookOpen}
                          title="Lessons not found"
                          description="No published lessons are available in this module yet."
                          className="border-0 py-6"
                        />
                      )}
                      {mod.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between gap-4 p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70 sm:px-6"
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
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 dark:text-slate-500">
                                <span>{lesson.durationMinutes} minutes</span>
                                <span className="capitalize">
                                  {lesson.contentType || lesson.type}
                                </span>
                                <span>{lesson.completed ? "Completed" : "Not completed"}</span>
                                {lesson.teachingCompleted && (
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    Teaching completed
                                  </span>
                                )}
                              </div>
                              {lesson.downloadableResources?.length ? (
                                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-300">
                                  <FileText className="h-3 w-3 shrink-0" />
                                  {lesson.downloadableResources.slice(0, 2).map((resource) => (
                                    <button
                                      key={resource.materialId || resource.name}
                                      type="button"
                                      disabled={!resource.materialId}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        if (resource.materialId) {
                                          void downloadMaterial(resource.materialId).catch(
                                            () => undefined,
                                          );
                                        }
                                      }}
                                      className="inline-flex max-w-[220px] items-center gap-1 truncate rounded-md bg-indigo-50 px-1.5 py-0.5 text-left font-medium hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60"
                                      title={`Download ${resource.name}`}
                                    >
                                      <span className="truncate">{resource.name}</span>
                                      <Download className="h-3 w-3 shrink-0" />
                                    </button>
                                  ))}
                                  {lesson.downloadableResources.length > 2 && (
                                    <span className="shrink-0 text-slate-400">
                                      +{lesson.downloadableResources.length - 2} more
                                    </span>
                                  )}
                                </div>
                              ) : null}
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
          {courseMaterials.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Materials not found"
              description="No learning materials are available for this course yet."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {courseMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-start justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      {mat.type} · {mat.fileSize}
                    </span>
                    <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white">
                      {mat.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {mat.description}
                    </p>
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
          )}
        </div>
      )}

      {/* Tab 4: Assignments */}
      {activeTab === "assignments" && (
        <div className="space-y-3">
          {courseAssignments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Assignments not found"
              description="No assignments have been published for this course yet."
            />
          ) : (
            courseAssignments.map((asg) => (
              <div
                key={asg.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
              >
                <div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    Due: {new Date(asg.dueDate).toLocaleDateString()}
                  </span>
                  <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white">
                    {asg.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
            ))
          )}
        </div>
      )}

      {/* Tab 5: Quizzes */}
      {activeTab === "quizzes" && (
        <div className="space-y-3">
          {courseQuizzes.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="Quizzes not found"
              description="No quizzes are available for this course yet."
            />
          ) : (
            courseQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                    {quiz.status.replace("_", " ")}
                  </span>
                  <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white">
                    {quiz.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {quiz.questionsCount} questions · {quiz.durationMinutes} minutes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuizId(quiz.id);
                    setCurrentView("quiz-taking");
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  Open Quiz
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Grades */}
      {activeTab === "grades" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 space-y-4">
          {!course.currentGrade && course.currentScorePercentage === undefined ? (
            <EmptyState
              compact
              icon={Award}
              title="Grades not found"
              description="No grades or results are available for this course yet."
              className="border-0 py-4"
            />
          ) : (
            <>
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
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based on completed homework problem sets, laboratory benchmarks, and quiz
                assessments.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

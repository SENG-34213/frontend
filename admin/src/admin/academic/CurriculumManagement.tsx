import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  Layers,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Course, Grade } from "../types";
import {
  AdminContentLesson,
  AdminContentModule,
  fetchCourseModules,
  fetchLessonMaterials,
  fetchModuleLessons,
} from "../api/courseContentApi";

/* The effects below synchronize selected filters and remote curriculum data. */
/* eslint-disable react-hooks/set-state-in-effect */

interface CurriculumManagementProps {
  courses: Course[];
  grades: Grade[];
}

type AdminModule = AdminContentModule & { lessons: AdminContentLesson[] };
const ALL = "all";
const lessonStatus = (lesson: AdminContentLesson) =>
  lesson.visible === false ? "DRAFT" : "PUBLISHED";

export const CurriculumManagement: React.FC<CurriculumManagementProps> = ({ courses, grades }) => {
  const [gradeId, setGradeId] = useState(ALL);
  const [domain, setDomain] = useState(ALL);
  const [courseId, setCourseId] = useState("");
  const [search, setSearch] = useState("");
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const gradeOptions = useMemo(() => {
    const values = new Map<string, string>();
    grades.forEach((grade) => values.set(grade.id, grade.name));
    courses.forEach((course) => {
      if (course.gradeId && course.gradeName) values.set(course.gradeId, course.gradeName);
    });
    return Array.from(values, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
  }, [courses, grades]);

  const gradeCourses = useMemo(
    () => (gradeId === ALL ? courses : courses.filter((course) => course.gradeId === gradeId)),
    [courses, gradeId],
  );

  const domainOptions = useMemo(() => {
    const selectedGrade = grades.find((grade) => grade.id === gradeId);
    const values = new Set<string>(selectedGrade?.subjectDomains || []);
    gradeCourses.forEach((course) => values.add(course.subject || course.category));
    return Array.from(values)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [gradeCourses, gradeId, grades]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return gradeCourses.filter((course) => {
      const courseDomain = course.subject || course.category;
      return (
        (domain === ALL || courseDomain === domain) &&
        (!query ||
          course.title.toLowerCase().includes(query) ||
          course.code.toLowerCase().includes(query))
      );
    });
  }, [domain, gradeCourses, search]);

  const activeCourse = courses.find((course) => course.id === courseId);
  const lessonCount = modules.reduce((total, module) => total + module.lessons.length, 0);
  const publishedLessons = modules.reduce(
    (total, module) =>
      total + module.lessons.filter((lesson) => lessonStatus(lesson) === "PUBLISHED").length,
    0,
  );

  useEffect(() => {
    if (domain !== ALL && !domainOptions.includes(domain)) setDomain(ALL);
  }, [domain, domainOptions]);

  useEffect(() => {
    if (courseId && filteredCourses.some((course) => course.id === courseId)) return;
    setCourseId(filteredCourses[0]?.id || "");
  }, [courseId, filteredCourses]);

  useEffect(() => {
    if (!courseId) {
      setModules([]);
      setError("");
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError("");
    setModules([]);
    fetchCourseModules(courseId, controller.signal)
      .then(async (items) => {
        const loaded = await Promise.all(
          items.map(async (module) => {
            const lessons = await fetchModuleLessons(courseId, module.id, controller.signal);
            const withMaterials = await Promise.all(
              lessons.map(async (lesson) => {
                try {
                  const materials = await fetchLessonMaterials(
                    courseId,
                    module.id,
                    lesson.id,
                    controller.signal,
                  );
                  return { ...lesson, materials };
                } catch {
                  return lesson;
                }
              }),
            );
            return { ...module, lessons: withMaterials };
          }),
        );
        setModules(loaded.sort((a, b) => a.sequenceOrder - b.sequenceOrder));
        setExpandedModules(Object.fromEntries(loaded.map((module) => [module.id, true])));
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Curriculum could not be loaded.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [courseId]);

  const resetFilters = () => {
    setGradeId(ALL);
    setDomain(ALL);
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modules & Lessons Explorer"
        description="Explore live curriculum data by grade, course domain, and course. Modules, lessons, and learning materials come from the academic content service."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Academic Management" },
          { label: "Modules & Lessons" },
        ]}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Curriculum filters
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose in sequence to narrow the catalogue.
              </p>
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Reset filters
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Grade
            <select
              value={gradeId}
              onChange={(event) => {
                setGradeId(event.target.value);
                setDomain(ALL);
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value={ALL}>All grades</option>
              {gradeOptions.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Course domain
            <select
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              disabled={!domainOptions.length}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value={ALL}>All domains</option>
              {domainOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Course
            <select
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              disabled={!filteredCourses.length}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Select a course</option>
              {filteredCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Search courses
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name or code"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold dark:bg-slate-800">
            {filteredCourses.length} matching courses
          </span>
          {activeCourse && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              Viewing {activeCourse.title}
            </span>
          )}
        </div>
      </section>

      {activeCourse && (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-500">Selected course</span>
            <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">
              {activeCourse.title}
            </p>
            <p className="mt-1 font-mono text-[11px] text-indigo-600">{activeCourse.code}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-500">Modules</span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {modules.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-500">Total lessons</span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{lessonCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-500">Published lessons</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{publishedLessons}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-sm text-slate-500 dark:border-slate-700">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-500" />
          Loading live modules and lessons…
        </div>
      )}
      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}
      {!isLoading && !error && !courseId && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Select a course to explore its curriculum
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Grade and domain filters update the available courses.
          </p>
        </div>
      )}
      {!isLoading && !error && courseId && modules.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <Sparkles className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            No modules have been published for this course yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            The selected course is connected, but its curriculum is empty.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {modules.map((module) => {
          const isExpanded = expandedModules[module.id] ?? true;
          return (
            <div
              key={module.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedModules((previous) => ({ ...previous, [module.id]: !isExpanded }))
                }
                className="flex w-full items-center justify-between gap-4 bg-slate-50/70 p-4 text-left transition-colors hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      Module {module.sequenceOrder}: {module.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span>{module.lessons.length} lessons</span>
                      {module.startDate && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {module.startDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>
              {isExpanded && (
                <div className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                  {module.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex flex-col gap-3 p-4 pl-6 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/20 sm:flex-row sm:items-center sm:justify-between sm:pl-12"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 font-mono text-[11px] text-slate-400">
                          {String(index + 1).padStart(2, "0")}.
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {lesson.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lesson.durationMinutes || 0} min
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {lesson.materials?.length || 0} materials
                            </span>
                            {lesson.contentType && (
                              <>
                                <span>·</span>
                                <span>{lesson.contentType}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:border-slate-700">
                          {lesson.teachingCompleted ? (
                            <>
                              <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-500" />
                              Completed
                            </>
                          ) : (
                            "In progress"
                          )}
                        </span>
                        <StatusBadge status={lessonStatus(lesson)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* eslint-enable react-hooks/set-state-in-effect */

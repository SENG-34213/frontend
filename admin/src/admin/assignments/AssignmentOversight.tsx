import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpenCheck,
  CalendarDays,
  FileCheck2,
  Filter,
  Loader2,
  Search,
  Send,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Assignment, Course, Grade } from "../types";
import { AdminAssignmentRecord, fetchCourseAssignments } from "../api/assignmentApi";
import { EmptyState } from "../../../../shared/ui/EmptyState";

/* These effects synchronize dependent filters and remote assignment data. */
/* eslint-disable react-hooks/set-state-in-effect */

interface AssignmentOversightProps {
  courses: Course[];
  grades: Grade[];
}

const ALL = "all";

const toAssignment = (item: AdminAssignmentRecord, course?: Course): Assignment => ({
  id: item.id,
  courseId: item.courseId,
  courseCode: course?.code || item.courseId,
  courseTitle: course?.title || "Unknown course",
  teacherName: course?.teacherName || "Unassigned faculty",
  title: item.title,
  dueDate: item.dueDate,
  totalSubmissions: item.totalSubmissions ?? 0,
  gradedSubmissions: item.gradedCount ?? 0,
  maxPoints: item.maxMarks,
  status: item.status,
});

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

export const AssignmentOversight: React.FC<AssignmentOversightProps> = ({ courses, grades }) => {
  const [gradeId, setGradeId] = useState(ALL);
  const [domain, setDomain] = useState(ALL);
  const [courseId, setCourseId] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [search, setSearch] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
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
    return gradeCourses.filter(
      (course) => domain === ALL || (course.subject || course.category) === domain,
    );
  }, [domain, gradeCourses]);

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assignments.filter((assignment) => {
      const matchesSearch =
        !query ||
        [
          assignment.title,
          assignment.courseCode,
          assignment.courseTitle,
          assignment.teacherName,
        ].some((value) => value.toLowerCase().includes(query));
      return (
        matchesSearch &&
        (courseId === ALL || assignment.courseId === courseId) &&
        (status === ALL || assignment.status === status)
      );
    });
  }, [assignments, courseId, search, status]);

  const totalSubmissions = filteredAssignments.reduce(
    (sum, assignment) => sum + assignment.totalSubmissions,
    0,
  );
  const gradedSubmissions = filteredAssignments.reduce(
    (sum, assignment) => sum + assignment.gradedSubmissions,
    0,
  );
  const pendingSubmissions = Math.max(totalSubmissions - gradedSubmissions, 0);
  const publishedCount = filteredAssignments.filter(
    (assignment) => assignment.status === "PUBLISHED",
  ).length;

  useEffect(() => {
    if (domain !== ALL && !domainOptions.includes(domain)) setDomain(ALL);
  }, [domain, domainOptions]);

  useEffect(() => {
    if (courseId !== ALL && filteredCourses.some((course) => course.id === courseId)) return;
    setCourseId(ALL);
  }, [courseId, filteredCourses]);

  useEffect(() => {
    const selectedCourses =
      courseId === ALL
        ? filteredCourses
        : filteredCourses.filter((course) => course.id === courseId);
    if (!selectedCourses.length) {
      setAssignments([]);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError("");
    Promise.allSettled(
      selectedCourses.map((course) => fetchCourseAssignments(course.id, controller.signal)),
    )
      .then((results) => {
        if (controller.signal.aborted) return;
        const successful = results.filter(
          (result): result is PromiseFulfilledResult<AdminAssignmentRecord[]> =>
            result.status === "fulfilled",
        );
        const loaded = successful
          .flatMap((result) => result.value)
          .map((item) =>
            toAssignment(
              item,
              courses.find((course) => course.id === item.courseId),
            ),
          );
        setAssignments(loaded);
        if (!successful.length && results.length)
          setError("Assignments could not be loaded for the selected courses.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [courseId, courses, filteredCourses]);

  const resetFilters = () => {
    setGradeId(ALL);
    setDomain(ALL);
    setCourseId(ALL);
    setStatus(ALL);
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignment Oversight"
        description="Monitor live assessment tasks, submission progress, grading backlogs, and publishing status across the academic catalogue."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Academic Management" },
          { label: "Assignments" },
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
                Assignment filters
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Narrow assignments by academic ownership and delivery status.
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
        <div className="grid gap-3 md:grid-cols-5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Grade
            <select
              value={gradeId}
              onChange={(event) => {
                setGradeId(event.target.value);
                setDomain(ALL);
                setCourseId(ALL);
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
              onChange={(event) => {
                setDomain(event.target.value);
                setCourseId(ALL);
              }}
              disabled={!domainOptions.length}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value={ALL}>All courses</option>
              {filteredCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value={ALL}>All statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Search assignments
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Title, course, teacher"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </label>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500">Assignments</span>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {filteredAssignments.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500">Published</span>
          <p className="mt-1 text-2xl font-bold text-indigo-600">{publishedCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500">Submissions</span>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {totalSubmissions}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500">Awaiting grading</span>
          <p className="mt-1 text-2xl font-bold text-amber-600">{pendingSubmissions}</p>
          <span className="text-[11px] text-slate-400">{gradedSubmissions} graded</span>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-sm text-slate-500 dark:border-slate-700">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-500" />
          Loading live assignments…
        </div>
      )}
      {!isLoading && error && (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {!isLoading && !error && !filteredAssignments.length && (
        <EmptyState
          icon={BookOpenCheck}
          title="No assignments found"
          description="Try another grade, domain, course, or status."
        />
      )}

      {!isLoading && filteredAssignments.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Assessment catalogue
              </h2>
              <p className="text-xs text-slate-500">
                {filteredAssignments.length} assignments in the current view
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Send className="h-3.5 w-3.5" />
              Live data
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-4 py-3 font-semibold">Assignment</th>
                  <th className="px-4 py-3 font-semibold">Course & faculty</th>
                  <th className="px-4 py-3 font-semibold">Grading progress</th>
                  <th className="px-4 py-3 font-semibold">Due date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssignments.map((assignment) => {
                  const gradedPercent = assignment.totalSubmissions
                    ? Math.round((assignment.gradedSubmissions / assignment.totalSubmissions) * 100)
                    : 0;
                  return (
                    <tr
                      key={assignment.id}
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                            <FileCheck2 className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-900 dark:text-white">
                              {assignment.title}
                            </span>
                            <span className="mt-1 block text-[11px] text-slate-400">
                              Max score: {assignment.maxPoints} pts
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {assignment.courseCode}
                        </span>
                        <span className="mt-1 block text-slate-500">{assignment.courseTitle}</span>
                        <span className="mt-1 block text-[11px] text-slate-400">
                          {assignment.teacherName}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="min-w-[170px]">
                          <div className="mb-1 flex justify-between text-[11px] font-semibold">
                            <span className="text-slate-700 dark:text-slate-300">
                              {assignment.gradedSubmissions} / {assignment.totalSubmissions} graded
                            </span>
                            <span className="text-slate-400">{gradedPercent}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${gradedPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(assignment.dueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={assignment.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* eslint-enable react-hooks/set-state-in-effect */

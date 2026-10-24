import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Course, Examination } from "../types";

interface ExaminationManagementProps {
  examinations: Examination[];
  courses: Course[];
}

export const ExaminationManagement: React.FC<ExaminationManagementProps> = ({
  examinations,
  courses,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const gradeNames = useMemo(
    () => Array.from(new Set(courses.map((course) => course.grade).filter(Boolean))).sort(),
    [courses],
  );
  const availableCourses =
    gradeFilter === "ALL" ? courses : courses.filter((course) => course.grade === gradeFilter);

  const filteredExams = examinations.filter((exam) => {
    const query = searchQuery.trim().toLowerCase();
    const course = courses.find((item) => item.id === exam.courseId);
    return (
      (!query ||
        [exam.title, exam.code, exam.courseCode, exam.courseTitle, course?.grade]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))) &&
      (gradeFilter === "ALL" || course?.grade === gradeFilter) &&
      (courseFilter === "ALL" || exam.courseId === courseFilter) &&
      (statusFilter === "ALL" || exam.status === statusFilter)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examination Management"
        description="Formal summative examinations, hall schedules, candidate room allocations, and proctor verification."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Academic Management" },
          { label: "Examinations" },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative min-w-[220px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exam, course, or grade..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <select
          aria-label="Filter examinations by grade"
          value={gradeFilter}
          onChange={(event) => {
            setGradeFilter(event.target.value);
            setCourseFilter("ALL");
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="ALL">All Grades</option>
          {gradeNames.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter examinations by course"
          value={courseFilter}
          onChange={(event) => setCourseFilter(event.target.value)}
          className="max-w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="ALL">All Courses</option>
          {availableCourses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} — {course.title}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter examinations by status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="ALL">All Statuses</option>
          {Array.from(new Set(examinations.map((exam) => exam.status)))
            .sort()
            .map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Exam Code</th>
                <th className="py-3 px-4 font-semibold">Title & Course</th>
                <th className="py-3 px-4 font-semibold">Date & Window</th>
                <th className="py-3 px-4 font-semibold">Venue / Venue Mode</th>
                <th className="py-3 px-4 font-semibold">Candidates</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-slate-500">
                    {searchQuery ||
                    gradeFilter !== "ALL" ||
                    courseFilter !== "ALL" ||
                    statusFilter !== "ALL"
                      ? "No examinations match the selected filters."
                      : "No examinations are available for the current courses."}
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {exam.code}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {exam.title}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {exam.courseCode}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <span className="font-medium block tabular-nums">{exam.examDate}</span>
                      <span className="text-[11px] text-slate-400">
                        {exam.startTime} – {exam.endTime}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {exam.hallOrPlatform}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white tabular-nums">
                      {exam.candidateCount} enrolled
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={exam.status as any} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

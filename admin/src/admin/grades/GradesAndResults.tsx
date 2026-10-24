import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import type { Course, GradeRecord } from "../types";

interface GradesAndResultsProps {
  grades: GradeRecord[];
  courses: Course[];
  loading?: boolean;
}

export const GradesAndResults: React.FC<GradesAndResultsProps> = ({
  grades,
  courses,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const gradeNames = useMemo(
    () => Array.from(new Set(courses.map((course) => course.grade).filter(Boolean))).sort(),
    [courses],
  );
  const availableCourses =
    gradeFilter === "ALL" ? courses : courses.filter((course) => course.grade === gradeFilter);
  const filteredGrades = grades.filter((grade) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        grade.studentName,
        grade.studentNumber,
        grade.courseCode,
        grade.courseTitle,
        grade.assessmentTitle,
        grade.gradeName,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    return (
      matchesSearch &&
      (gradeFilter === "ALL" || grade.gradeName === gradeFilter) &&
      (courseFilter === "ALL" || grade.courseId === courseFilter) &&
      (typeFilter === "ALL" || grade.assessmentType === typeFilter)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grades & Results Gradebook"
        description="Published assignment, quiz, and examination marks across courses."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Academic Management" },
          { label: "Grades & Results" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <label className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search student, course, or assessment..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </label>
        <select
          aria-label="Filter results by grade"
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
          aria-label="Filter results by course"
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
          aria-label="Filter results by assessment type"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="ALL">All Assessments</option>
          <option value="ASSIGNMENT">Assignments</option>
          <option value="QUIZ">Quizzes</option>
          <option value="MIDTERM">Examinations</option>
          <option value="FINAL_EXAM">Final examinations</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Grade / Course</th>
                <th className="px-4 py-3 font-semibold">Assessment</th>
                <th className="px-4 py-3 font-semibold">Score / Max</th>
                <th className="px-4 py-3 font-semibold">Result</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGrades.map((grade) => (
                <tr key={grade.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <span className="block font-semibold text-slate-900 dark:text-white">
                      {grade.studentName || "Student name unavailable"}
                    </span>
                    {grade.studentNumber && (
                      <span className="text-[11px] text-slate-400">{grade.studentNumber}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block font-medium text-slate-800 dark:text-slate-200">
                      {grade.gradeName || "Grade unavailable"}
                    </span>
                    <span className="text-slate-500">
                      {grade.courseCode} · {grade.courseTitle}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    <span className="block font-medium">{grade.assessmentTitle}</span>
                    <span className="text-[10px] uppercase text-slate-400">
                      {grade.assessmentType.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                    {grade.score} / {grade.maxScore}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {grade.letterGrade}
                    </span>
                    {grade.percentage != null && (
                      <span className="ml-2 text-slate-500">{grade.percentage.toFixed(1)}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {grade.updatedAt || grade.gradedDate
                      ? new Date(grade.updatedAt || grade.gradedDate).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {filteredGrades.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    {loading
                      ? "Loading published results…"
                      : grades.length === 0
                        ? "No published results are available for these courses yet."
                        : "No results match the selected filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

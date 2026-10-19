import React, { useEffect, useMemo, useState } from "react";
import { Download, Search, Check } from "lucide-react";
import type { NavigationTab } from "../types";
import type { BackendCourse } from "../api/courseApi";
import {
  getCourseAssignments,
  getAssignmentSubmissions,
  type BackendAssignment,
} from "../api/assignmentApi";
import { getCourseExams, getExamResults, type BackendExam, type ExamResult } from "../api/examApi";
import { getCourseEnrollments } from "../api/enrollmentApi";

type Row = {
  studentId: string;
  assignments: Record<string, number | null>;
  exams: Record<string, number | null>;
};
interface GradebookViewProps {
  onNavigate: (tab: NavigationTab) => void;
  courses: BackendCourse[];
}
function valueOf(value: number | string | null | undefined) {
  return value === null || value === undefined || value === "" ? null : Number(value);
}
function grade(percent: number) {
  return percent >= 90
    ? "A"
    : percent >= 80
      ? "B"
      : percent >= 70
        ? "C"
        : percent >= 60
          ? "D"
          : "F";
}

export const GradebookView: React.FC<GradebookViewProps> = ({ courses }) => {
  const [courseId, setCourseId] = useState("");
  const [search, setSearch] = useState("");
  const [assignments, setAssignments] = useState<BackendAssignment[]>([]);
  const [exams, setExams] = useState<BackendExam[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);
  useEffect(() => {
    if (!courseId && courses[0]?.id) setCourseId(courses[0].id);
  }, [courseId, courses]);
  useEffect(() => {
    if (!courseId) {
      setRows([]);
      setAssignments([]);
      setExams([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    Promise.all([
      getCourseEnrollments(courseId, controller.signal),
      getCourseAssignments(courseId, controller.signal),
      getCourseExams(courseId, controller.signal),
    ])
      .then(async ([enrollments, nextAssignments, nextExams]) => {
        const map = new Map<string, Row>();
        enrollments.forEach((item) =>
          map.set(item.studentId, { studentId: item.studentId, assignments: {}, exams: {} }),
        );
        const [submissions, resultSheets] = await Promise.all([
          Promise.all(
            nextAssignments.map((item) => getAssignmentSubmissions(item.id, controller.signal)),
          ),
          Promise.all(nextExams.map((item) => getExamResults(item.id))),
        ]);
        submissions.forEach((items, index) =>
          items.forEach((item) => {
            const row = map.get(item.studentId) ?? {
              studentId: item.studentId,
              assignments: {},
              exams: {},
            };
            const marks = valueOf(item.marks);
            row.assignments[nextAssignments[index].id] =
              marks === null ? null : (marks / nextAssignments[index].maxMarks) * 100;
            map.set(item.studentId, row);
          }),
        );
        resultSheets.forEach((sheet, index) =>
          sheet.results.forEach((item: ExamResult) => {
            const row = map.get(item.studentId) ?? {
              studentId: item.studentId,
              assignments: {},
              exams: {},
            };
            const marks = valueOf(item.marksObtained);
            const totalMarks = Number(nextExams[index].totalMarks);
            row.exams[nextExams[index].id] =
              marks === null || !totalMarks ? null : (marks / totalMarks) * 100;
            map.set(item.studentId, row);
          }),
        );
        setAssignments(nextAssignments);
        setExams(nextExams);
        setRows(Array.from(map.values()));
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setRows([]);
          setError(
            requestError instanceof Error ? requestError.message : "Unable to load gradebook data.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [courseId]);
  const filtered = useMemo(
    () => rows.filter((row) => row.studentId.toLowerCase().includes(search.toLowerCase())),
    [rows, search],
  );
  const marks = rows
    .flatMap((row) => [...Object.values(row.assignments), ...Object.values(row.exams)])
    .filter((item): item is number => item !== null);
  const average = marks.length ? marks.reduce((sum, item) => sum + item, 0) / marks.length : null;
  const exportCsv = () => {
    const csv = [
      "Student ID,Assignments,Exams",
      ...filtered.map((row) =>
        [row.studentId, ...Object.values(row.assignments), ...Object.values(row.exams)].join(","),
      ),
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "gradebook.csv";
    link.click();
    setExported(true);
    window.setTimeout(() => setExported(false), 2000);
  };
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Gradebook & Academic Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Live assignment and examination results for your courses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden shadow-2xs"
          >
            {courses.length === 0 && <option value="">No courses available</option>}
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code || course.courseName} — {course.title || course.courseName}
              </option>
            ))}
          </select>
          <button
            onClick={exportCsv}
            disabled={!filtered.length}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {exported ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Exported!
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          [
            "Class Grade Average",
            average === null ? "—" : String(average.toFixed(1)) + "%",
            "From returned marks",
          ],
          ["Total Roster Size", rows.length, "Live enrollment roster"],
          ["Assessments", assignments.length + exams.length, "Assignments and exams"],
          ["Marks Returned", marks.length, "Backend result records"],
        ].map(([label, value, hint]) => (
          <div key={label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">{label}</span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
              {value}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        {error && (
          <div className="px-5 py-3 border-b border-rose-200 bg-rose-50 text-xs text-rose-800">
            {error}
          </div>
        )}
        {loading ? (
          <div className="px-5 py-12 text-center text-xs text-slate-500">Loading gradebook...</div>
        ) : (
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3 sticky left-0 bg-slate-50 z-10">Student ID</th>
                {assignments.map((item) => (
                  <th key={item.id} className="px-4 py-3 text-right">
                    {item.title}
                  </th>
                ))}
                {exams.map((item) => (
                  <th key={item.id} className="px-4 py-3 text-right">
                    {item.title}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Overall</th>
                <th className="px-5 py-3 text-center">Letter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={assignments.length + exams.length + 3}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No gradebook records available.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const values = [
                    ...Object.values(row.assignments),
                    ...Object.values(row.exams),
                  ].filter((item): item is number => item !== null);
                  const percent = values.length
                    ? values.reduce((sum, item) => sum + item, 0) / values.length
                    : null;
                  return (
                    <tr key={row.studentId} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 sticky left-0 bg-white font-sans font-semibold text-slate-900">
                        {row.studentId}
                      </td>
                      {assignments.map((item) => (
                        <td key={item.id} className="px-4 py-3.5 text-right">
                          {row.assignments[item.id] ?? "—"}
                        </td>
                      ))}
                      {exams.map((item) => (
                        <td key={item.id} className="px-4 py-3.5 text-right">
                          {row.exams[item.id] ?? "—"}
                        </td>
                      ))}
                      <td className="px-4 py-3.5 text-right font-bold">
                        {percent === null ? "—" : String(percent.toFixed(1)) + "%"}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {percent === null ? (
                          "—"
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold font-sans bg-indigo-50 text-indigo-700">
                            {grade(percent)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useState } from "react";
import { Check, Download, Search } from "lucide-react";
import type { NavigationTab } from "../types";
import type { BackendCourse } from "../api/courseApi";
import { getTeacherGradebook, type TeacherGradebook } from "../api/gradebookApi";

interface GradebookViewProps {
  onNavigate: (tab: NavigationTab) => void;
  courses: BackendCourse[];
}

const numberValue = (value: number | string | null | undefined) =>
  value === null || value === undefined || value === "" ? null : Number(value);

export const GradebookView: React.FC<GradebookViewProps> = ({ courses }) => {
  const [courseId, setCourseId] = useState("");
  const [search, setSearch] = useState("");
  const [gradebook, setGradebook] = useState<TeacherGradebook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    if (!courseId && courses[0]?.id) setCourseId(courses[0].id);
    if (courseId && !courses.some((course) => course.id === courseId)) setCourseId("");
  }, [courseId, courses]);

  useEffect(() => {
    if (!courseId) {
      setGradebook(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getTeacherGradebook(courseId, controller.signal)
      .then(setGradebook)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setGradebook(null);
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

  const rows = useMemo(() => gradebook?.students ?? [], [gradebook]);
  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return rows.filter((row) =>
      [row.studentId, row.studentNumber, row.studentName, row.email]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [rows, search]);
  const uniqueItems = (items: (typeof rows)[number]["assignments"]) =>
    items.filter(
      (item, index, all) =>
        all.findIndex((candidate) => candidate.assessmentId === item.assessmentId) === index,
    );
  const assignments = uniqueItems(rows.flatMap((row) => row.assignments));
  const quizzes = uniqueItems(rows.flatMap((row) => row.quizzes));
  const exams = uniqueItems(rows.flatMap((row) => row.exams));
  const allItems = rows.flatMap((row) => [...row.assignments, ...row.quizzes, ...row.exams]);
  const marksReturned = allItems.filter(
    (item) => numberValue(item.status === "MISSING" ? null : item.score) !== null,
  );

  const exportCsv = () => {
    const csv = [
      "Student ID,Student Name,Assignments,Quizzes,Exams,Overall,Letter",
      ...filtered.map((row) =>
        [
          row.studentNumber || row.studentId,
          row.studentName || "Unavailable",
          row.assignments.map((item) => item.percentage ?? "").join(";"),
          row.quizzes.map((item) => item.percentage ?? "").join(";"),
          row.exams.map((item) => item.percentage ?? "").join(";"),
          row.overallPercentage ?? row.percentage ?? "",
          row.letterGrade ?? row.grade ?? "",
        ].join(","),
      ),
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "gradebook.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    setExported(true);
    window.setTimeout(() => setExported(false), 2000);
  };

  const renderPercentage = (row: (typeof rows)[number], id: string) => {
    const item = [...row.assignments, ...row.quizzes, ...row.exams].find(
      (entry) => entry.assessmentId === id,
    );
    const percentage = numberValue(item?.percentage);
    return percentage === null ? "—" : `${percentage.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Gradebook & Academic Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Live assignment, quiz, and examination results for your courses.
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
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Exported!
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
              </>
            )}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          [
            "Class Grade Average",
            gradebook?.summary?.averagePercentage == null
              ? "—"
              : `${Number(gradebook.summary.averagePercentage).toFixed(1)}%`,
            "From completed assessments",
          ],
          [
            "Total Roster Size",
            gradebook?.summary?.studentCount ?? rows.length,
            "Live enrollment roster",
          ],
          [
            "Assessments",
            assignments.length + quizzes.length + exams.length,
            "Assignments, quizzes, and exams",
          ],
          ["Marks Returned", marksReturned.length, "Backend result records"],
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
            placeholder="Search students by name, ID, or email..."
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
        ) : !courseId ? (
          <div className="px-5 py-12 text-center text-xs text-slate-400">No courses available.</div>
        ) : (
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3 sticky left-0 bg-slate-50 z-10">Student</th>
                {[...assignments, ...quizzes, ...exams].map((item) => (
                  <th key={item.assessmentId} className="px-4 py-3 text-right">
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
                    colSpan={assignments.length + quizzes.length + exams.length + 3}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No gradebook records available.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 sticky left-0 bg-white font-sans font-semibold text-slate-900">
                      <div>{row.studentName || "Name unavailable"}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {row.studentNumber || row.studentId}
                      </div>
                    </td>
                    {[...assignments, ...quizzes, ...exams].map((item) => (
                      <td key={item.assessmentId} className="px-4 py-3.5 text-right">
                        {renderPercentage(row, item.assessmentId)}
                      </td>
                    ))}
                    <td className="px-4 py-3.5 text-right font-bold">
                      {numberValue(row.overallPercentage ?? row.percentage) === null
                        ? "—"
                        : `${Number(row.overallPercentage ?? row.percentage).toFixed(1)}%`}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {row.letterGrade || row.grade || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

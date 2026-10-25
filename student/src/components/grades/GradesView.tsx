import React from "react";
import { CheckCircle2, ClipboardList, Filter, Search } from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { EmptyState } from "../../../../shared/ui/EmptyState";

export const GradesView: React.FC = () => {
  const { courses, assignments, quizzes, examinations } = useStudent();
  const [courseFilter, setCourseFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const enrolledCourses = courses.filter((course) => course.enrolled);
  const resultRows = [
    ...assignments
      .filter((assignment) => assignment.status === "GRADED" && assignment.grade != null)
      .map((assignment) => ({
        id: `assignment-${assignment.id}`,
        courseId: assignment.courseId,
        courseCode: assignment.courseCode,
        title: assignment.title,
        category: "Assignment",
        score: Number(assignment.grade),
        maxScore: assignment.maxScore,
        grade: assignment.letterGrade || "—",
        feedback: assignment.feedback || "No feedback provided",
      })),
    ...quizzes
      .filter((quiz) => quiz.status === "COMPLETED" && quiz.lastScore != null)
      .map((quiz) => ({
        id: `quiz-${quiz.id}`,
        courseId: quiz.courseId,
        courseCode: quiz.courseCode,
        title: quiz.title,
        category: "Quiz",
        score: Number(quiz.lastScore),
        maxScore: quiz.totalPoints,
        grade:
          quiz.lastScorePercentage == null
            ? "—"
            : `${Number(quiz.lastScorePercentage).toFixed(1)}%`,
        feedback: "Quiz result",
      })),
    ...examinations
      .filter((exam) => exam.status === "COMPLETED" && exam.score != null)
      .map((exam) => ({
        id: `exam-${exam.id}`,
        courseId: exam.courseId,
        courseCode: exam.courseCode,
        title: exam.title,
        category: "Examination",
        score: Number(exam.score),
        maxScore: exam.totalMarks,
        grade: exam.letterGrade || exam.resultStatus || "—",
        feedback: exam.remarks || exam.attendanceStatus || "Result published",
      })),
  ];
  const filteredResults = resultRows.filter((result) => {
    const matchesCourse = courseFilter === "all" || result.courseId === courseFilter;
    const matchesCategory = categoryFilter === "all" || result.category === categoryFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [result.title, result.courseCode, result.category].some((value) =>
        value.toLowerCase().includes(query),
      );
    return matchesCourse && matchesCategory && matchesSearch;
  });
  const averagePercentage = resultRows.length
    ? resultRows.reduce(
        (total, result) =>
          total + (result.maxScore > 0 ? (result.score / result.maxScore) * 100 : 0),
        0,
      ) / resultRows.length
    : null;
  const academicStanding =
    averagePercentage == null
      ? "No results yet"
      : averagePercentage >= 75
        ? "Good Standing"
        : averagePercentage >= 50
          ? "Satisfactory"
          : "Needs Improvement";
  const standingColor =
    averagePercentage == null
      ? "text-slate-500"
      : averagePercentage >= 50
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-rose-600 dark:text-rose-400";

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Grades & Results
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Published assignment, quiz, and examination results
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500">Overall Average</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              {averagePercentage == null ? "—" : `${averagePercentage.toFixed(1)}%`}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {averagePercentage == null ? "Not available" : "Published results"}
            </span>
          </div>
          <span className="mt-1 block text-xs text-slate-500">
            Average across published assessment results
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500">Academic Standing</span>
          <div className={`mt-2 flex items-center gap-1.5 ${standingColor}`}>
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-display text-lg font-bold">{academicStanding}</span>
          </div>
          <span className="mt-1 block text-xs text-slate-500">
            {averagePercentage == null
              ? "Standing appears after results are published"
              : `Based on a ${averagePercentage.toFixed(1)}% published-results average`}
          </span>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Official Evaluation Ledger
          </h2>
          <span className="text-xs text-slate-500">
            Published assignment, quiz, and examination results
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 dark:border-slate-700">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by assessment or course..."
              className="w-full bg-transparent py-2 text-xs text-slate-700 outline-none dark:text-slate-200"
            />
          </label>
          <select
            aria-label="Filter results by course"
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="all">All courses</option>
            {enrolledCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.title}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 dark:border-slate-700">
            <Filter className="h-4 w-4 shrink-0 text-slate-400" />
            <select
              aria-label="Filter results by category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full bg-transparent py-2 text-xs text-slate-700 outline-none dark:text-slate-200"
            >
              <option value="all">All categories</option>
              <option value="Assignment">Assignments</option>
              <option value="Quiz">Quizzes</option>
              <option value="Examination">Examinations</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Deliverable Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Points Earned</th>
                <th className="px-4 py-3 text-right">Percentage</th>
                <th className="px-4 py-3 text-center">Grade</th>
                <th className="px-4 py-3">Instructor Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans dark:divide-slate-800">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3.5 font-mono font-bold text-indigo-600">
                    {result.courseCode || "—"}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white">
                    {result.title}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{result.category}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums">
                    {result.score} / {result.maxScore || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-500">
                    {result.maxScore > 0
                      ? `${((result.score / result.maxScore) * 100).toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-center">{result.grade}</td>
                  <td className="max-w-xs truncate px-4 py-3.5 text-slate-500">
                    {result.feedback}
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-4">
                    <EmptyState
                      icon={ClipboardList}
                      compact
                      title={resultRows.length === 0 ? "No results yet" : "No results found"}
                      description={
                        resultRows.length === 0
                          ? "Published assignment, quiz, and exam results will appear here."
                          : "No results match the selected filters."
                      }
                    />
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

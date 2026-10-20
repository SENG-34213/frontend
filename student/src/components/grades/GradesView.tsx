import React, { useState } from "react";
import {
  TrendingUp,
  Award,
  Download,
  BookOpen,
  CheckCircle2,
  Filter,
  BarChart2,
  FileSpreadsheet,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const GradesView: React.FC = () => {
  const { courses, profile, assignments, showToast } = useStudent();
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("All");

  const enrolledCourses = courses.filter((c) => c.enrolled);

  const gradedAssignments = assignments.filter((a) => a.status === "GRADED");

  const handleExportTranscript = () => {
    showToast("Official Grade Transcript PDF generated and downloaded.");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Grades & Results
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive evaluation transcripts, course letter grades, and assessment weightage
            distributions
          </p>
        </div>
        <button
          onClick={handleExportTranscript}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Official Transcript</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Cumulative GPA</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              {profile.currentGpa.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 4.00 Scale</span>
          </div>
          <span className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
            Dean's First Class Honors
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Overall Average</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              92.4%
            </span>
            <span className="text-xs font-bold text-emerald-600">Grade A</span>
          </div>
          <span className="mt-1 text-xs text-slate-500 block">Across 6 courses this term</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Credits Completed</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              {profile.creditsCompleted}
            </span>
            <span className="text-xs text-slate-400">/ {profile.totalCreditsRequired} Units</span>
          </div>
          <span className="mt-1 text-xs text-slate-500 block">Senior Standing (Year 4)</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Academic Standing</span>
          <div className="mt-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-display text-lg font-bold">Good Standing</span>
          </div>
          <span className="mt-1 text-xs text-slate-500 block">Zero Academic Deficiencies</span>
        </div>
      </div>

      {/* Course Breakdown Cards */}
      <div className="space-y-4">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Active Course Grades (Fall 2026)
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {course.code}
                  </span>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500">{course.credits} Academic Credits</p>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {course.currentGrade || "A"}
                  </span>
                  <span className="text-xs text-slate-400 block tabular-nums">
                    {course.currentScorePercentage || 94.2}%
                  </span>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${course.currentScorePercentage || 94.2}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Faculty: {course.instructor.name.split(" ")[1]}</span>
                <span className="font-medium text-emerald-600">On Track for Distinction</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graded Deliverables Ledger */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Official Evaluation Ledger
          </h2>
          <span className="text-xs text-slate-500">
            Showing all published problem sets, laboratory benchmarks, and exams
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Deliverable Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Points Earned</th>
                <th className="py-3 px-4 text-right">Weight</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4">Instructor Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">DES 210</td>
                <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                  Milestone 2: Design Token Architecture
                </td>
                <td className="py-3.5 px-4 text-slate-500">Assignment</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                  98 / 100
                </td>
                <td className="py-3.5 px-4 text-right text-slate-500">15%</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    A+
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                  "Exemplary separation of primitive and semantic tokens."
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">CS 440</td>
                <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                  Quiz 2: Optimization & Attention Mechanics
                </td>
                <td className="py-3.5 px-4 text-slate-500">Quiz</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">19 / 20</td>
                <td className="py-3.5 px-4 text-right text-slate-500">10%</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    A
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                  "Solid understanding of the 1/sqrt(d_k) scaling rationale."
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">CS 301</td>
                <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                  Assignment 3: Red-Black Tree Balancing
                </td>
                <td className="py-3.5 px-4 text-slate-500">Assignment</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                  94 / 100
                </td>
                <td className="py-3.5 px-4 text-right text-slate-500">15%</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    A
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                  "Clean left-leaning rotation logic. Check leaf invariants."
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

"use client";
import React from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const GradesView: React.FC = () => {
  const { courses, profile, showToast } = useStudent();

  const enrolledCourses = courses.filter((c) => c.enrolled);

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
            Dean&apos;s First Class Honors
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
          <span className="text-xs font-medium text-slate-500">Completed Credits</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              {profile.creditsCompleted}
            </span>
            <span className="text-xs text-slate-400">/ {profile.totalCreditsRequired} required</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{
                width: `${Math.round((profile.creditsCompleted / profile.totalCreditsRequired) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Academic Standing</span>
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            <span className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Good Standing
            </span>
          </div>
          <span className="mt-1 text-xs text-slate-500 block">Eligible for Capstone Thesis</span>
        </div>
      </div>

      {/* Course Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Active Enrolled Course Performance
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 text-center">Credits</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4 text-right">Raw Score</th>
                <th className="py-3 px-4 text-center">Letter Grade</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {enrolledCourses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {c.code}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {c.title}
                  </td>
                  <td className="py-3.5 px-4 text-center tabular-nums text-slate-600 dark:text-slate-300">
                    {c.credits}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{c.instructor.name}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                    {c.currentScorePercentage || 92}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {c.currentGrade || "A"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      In Progress
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graded Assessment History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Recent Graded Assessments
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Assessment Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Score</th>
                <th className="py-3 px-4 text-right">Weight</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4">Instructor Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
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
                  &ldquo;Exemplary separation of primitive and semantic tokens.&rdquo;
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
                  &ldquo;Solid understanding of the 1/sqrt(d_k) scaling rationale.&rdquo;
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
                  &ldquo;Clean left-leaning rotation logic. Check leaf invariants.&rdquo;
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

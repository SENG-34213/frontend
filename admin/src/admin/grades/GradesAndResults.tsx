import React, { useState } from "react";
import { BarChart3, Search, Filter, Award, CheckCircle2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { GradeRecord } from "../types";

interface GradesAndResultsProps {
  grades: GradeRecord[];
}

export const GradesAndResults: React.FC<GradesAndResultsProps> = ({ grades }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");

  const filteredGrades = grades.filter((g) => {
    const matchesSearch =
      g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.assessmentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "ALL" || g.courseCode === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grades & Results Gradebook"
        description="Comprehensive evaluation ledger, assessment mark distributions, faculty feedback records, and grade verification."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Academic Management" },
          { label: "Grades & Results" },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, ID, or assessment title..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="ALL">All Courses</option>
          <option value="MATH-401">MATH-401</option>
          <option value="CS-302">CS-302</option>
          <option value="PHYS-402">PHYS-402</option>
        </select>
      </div>

      {/* Gradebook Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Student Name & ID</th>
                <th className="py-3 px-4 font-semibold">Course</th>
                <th className="py-3 px-4 font-semibold">Assessment</th>
                <th className="py-3 px-4 font-semibold">Score / Max</th>
                <th className="py-3 px-4 font-semibold">Letter Grade</th>
                <th className="py-3 px-4 font-semibold">Evaluator Feedback</th>
                <th className="py-3 px-4 font-semibold">Graded Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGrades.map((grade) => (
                <tr
                  key={grade.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {grade.studentName}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{grade.studentId}</span>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {grade.courseCode}
                  </td>

                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <span className="font-medium block">{grade.assessmentTitle}</span>
                    <span className="text-[10px] uppercase text-slate-400">
                      {grade.assessmentType.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {grade.score} / {grade.maxScore}
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {grade.letterGrade}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                    {grade.feedback || "No remarks recorded"}
                  </td>

                  <td className="py-3 px-4 text-slate-500 tabular-nums">{grade.gradedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

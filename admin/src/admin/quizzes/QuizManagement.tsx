import React, { useState } from "react";
import { HelpCircle, Search, BarChart3, Clock, CheckCircle2, Award } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { DetailDrawer } from "../components/DetailDrawer";
import { Quiz } from "../types";

interface QuizManagementProps {
  quizzes: Quiz[];
}

export const QuizManagement: React.FC<QuizManagementProps> = ({ quizzes }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.teacherName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quiz Management & Analytics"
        description="Monitor automated formative quiz assessments, student attempt distributions, score medians, and question pass rates."
        breadcrumbs={[{ label: "Admin" }, { label: "Academic Management" }, { label: "Quizzes" }]}
      />

      {/* Analytics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">
            Average Institutional Quiz Score
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            83.6%
          </span>
          <span className="text-[11px] text-emerald-600 block mt-1">
            +2.4% vs midterm benchmark
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">Total Quiz Attempts Recorded</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            183 Attempts
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Across 3 active courses</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">Average Passing Rate</span>
          <span className="text-2xl font-bold text-emerald-600 tabular-nums">91.0%</span>
          <span className="text-[11px] text-slate-400 block mt-1">Threshold: 70% passing</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title or course code..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Quiz Title</th>
                <th className="py-3 px-4 font-semibold">Course & Faculty</th>
                <th className="py-3 px-4 font-semibold">Questions & Time</th>
                <th className="py-3 px-4 font-semibold">Attempts</th>
                <th className="py-3 px-4 font-semibold">Average Score</th>
                <th className="py-3 px-4 font-semibold">Passing Rate</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuizzes.map((quiz) => (
                <tr
                  key={quiz.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {quiz.title}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                      {quiz.courseCode}
                    </span>
                    <span className="text-slate-500">{quiz.teacherName}</span>
                  </td>

                  <td className="py-3 px-4 tabular-nums text-slate-600 dark:text-slate-300">
                    {quiz.questionCount} Qs · {quiz.durationMinutes} mins
                  </td>

                  <td className="py-3 px-4 font-medium tabular-nums text-slate-900 dark:text-white">
                    {quiz.attemptsCount} attempts
                  </td>

                  <td className="py-3 px-4 font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                    {quiz.averageScore}%
                  </td>

                  <td className="py-3 px-4 font-bold tabular-nums text-emerald-600">
                    {quiz.passingRate}%
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={quiz.status} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedQuiz(quiz)}
                      className="px-2.5 py-1 text-xs font-medium rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    >
                      Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUIZ ANALYTICS DRAWER */}
      {selectedQuiz && (
        <DetailDrawer
          isOpen={!!selectedQuiz}
          title={selectedQuiz.title}
          subtitle={`${selectedQuiz.courseCode} · Formative Assessment Analytics`}
          onClose={() => setSelectedQuiz(null)}
          width="lg"
        >
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Mean Score</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {selectedQuiz.averageScore}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Pass Rate</span>
                <span className="text-xl font-bold text-emerald-600 tabular-nums">
                  {selectedQuiz.passingRate}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <h5 className="font-semibold text-slate-900 dark:text-white">
                Score Distribution Breakdown
              </h5>
              <div className="space-y-2">
                {[
                  { range: "90 - 100% (High Distinction)", count: 28, pct: 42 },
                  { range: "80 - 89% (Distinction)", count: 24, pct: 36 },
                  { range: "70 - 79% (Credit)", count: 9, pct: 14 },
                  { range: "< 70% (Below Threshold)", count: 5, pct: 8 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-300">{item.range}</span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {item.count} students ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DetailDrawer>
      )}
    </div>
  );
};

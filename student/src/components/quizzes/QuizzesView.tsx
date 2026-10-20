import React, { useState } from "react";
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
  AlertCircle,
  X,
  FileQuestion,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { Quiz } from "../../types";

export const QuizzesView: React.FC = () => {
  const { quizzes, setSelectedQuizId, setCurrentView } = useStudent();
  const [activeTab, setActiveTab] = useState<"AVAILABLE" | "COMPLETED" | "ALL">("ALL");
  const [instructionModalQuiz, setInstructionModalQuiz] = useState<Quiz | null>(null);

  const displayedQuizzes = quizzes.filter((q) => {
    if (activeTab === "ALL") return true;
    return q.status === activeTab;
  });

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuizId(quiz.id);
    setInstructionModalQuiz(null);
    setCurrentView("quiz-taking");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Quizzes & Knowledge Checks
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Reinforce algorithmic concepts and verify module mastery with timed formative assessments
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {(["ALL", "AVAILABLE", "COMPLETED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2.5 capitalize transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            {tab.toLowerCase()} (
            {tab === "ALL" ? quizzes.length : quizzes.filter((q) => q.status === tab).length})
          </button>
        ))}
      </div>

      {/* Quiz Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedQuizzes.map((quiz) => {
          const isCompleted = quiz.status === "COMPLETED";

          return (
            <div
              key={quiz.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {quiz.courseCode}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                    }`}
                  >
                    {isCompleted ? "Completed" : "Available"}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>
                </div>

                <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Duration:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {quiz.durationMinutes} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Questions:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {quiz.questionsCount || quiz.questions.length} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Attempts:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {quiz.attemptsUsed} of {quiz.attemptsAllowed} used
                    </span>
                  </div>

                  {isCompleted && quiz.lastScore !== undefined && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Highest Score:</span>
                      <span className="font-mono tabular-nums">
                        {quiz.lastScore}/{quiz.totalPoints} ({quiz.lastScorePercentage}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                {isCompleted ? (
                  <button
                    onClick={() => setInstructionModalQuiz(quiz)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Review or Retake</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setInstructionModalQuiz(quiz)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span>Start Quiz</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Instructions Modal */}
      {instructionModalQuiz && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quiz Instructions"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {instructionModalQuiz.courseCode} · Instructions
                </span>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {instructionModalQuiz.title}
                </h3>
              </div>
              <button
                onClick={() => setInstructionModalQuiz(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 font-medium">
                <div>Duration: {instructionModalQuiz.durationMinutes} Minutes</div>
                <div>
                  Questions:{" "}
                  {instructionModalQuiz.questionsCount || instructionModalQuiz.questions.length}{" "}
                  Items
                </div>
                <div>Total Points: {instructionModalQuiz.totalPoints} pts</div>
                <div>Attempts: {instructionModalQuiz.attemptsAllowed} Maximum</div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Assessment Rules:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>The timer begins the moment you click "Begin Quiz" and cannot be paused.</li>
                  <li>You may flag questions and return to them using the question palette.</li>
                  <li>Answers are autosaved continuously in your browser session.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInstructionModalQuiz(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartQuiz(instructionModalQuiz)}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
              >
                Begin Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

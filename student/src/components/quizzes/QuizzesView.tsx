"use client";
import React, { useState } from "react";
import { PlayCircle, RotateCcw, X } from "lucide-react";
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
    setCurrentView("quiz-taking");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quizzes & Knowledge Checks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Formative topic assessments, practice check-ins, and module review tests
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === "ALL"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          All Quizzes ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab("AVAILABLE")}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === "AVAILABLE"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Available ({quizzes.filter((q) => q.status === "AVAILABLE").length})
        </button>
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === "COMPLETED"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Completed ({quizzes.filter((q) => q.status === "COMPLETED").length})
        </button>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {quiz.courseCode}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    quiz.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  }`}
                >
                  {quiz.status === "COMPLETED" ? "Submitted" : "Open for Attempt"}
                </span>
              </div>

              <div>
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {quiz.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {quiz.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Time Limit</span>
                  <span className="font-semibold">{quiz.durationMinutes} minutes</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Items</span>
                  <span className="font-semibold">{quiz.questionsCount} Questions</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Score</span>
                  <span className="font-semibold">{quiz.totalPoints} Points</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Attempts</span>
                  <span className="font-semibold">
                    {quiz.attemptsUsed} / {quiz.attemptsAllowed}
                  </span>
                </div>
              </div>

              {quiz.status === "COMPLETED" && quiz.lastScorePercentage !== undefined && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/20 text-xs">
                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-semibold">
                    <span>Highest Recorded Score</span>
                    <span className="font-mono">
                      {quiz.lastScore} / {quiz.totalPoints} ({quiz.lastScorePercentage}%)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              {quiz.status === "AVAILABLE" ? (
                <button
                  onClick={() => setInstructionModalQuiz(quiz)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Start Quiz Attempt</span>
                </button>
              ) : quiz.attemptsUsed < quiz.attemptsAllowed ? (
                <button
                  onClick={() => setInstructionModalQuiz(quiz)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retake Quiz ({quiz.attemptsAllowed - quiz.attemptsUsed} left)</span>
                </button>
              ) : (
                <div className="text-center text-xs font-medium text-slate-400 py-1.5">
                  Maximum Attempts Used
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions Modal before starting */}
      {instructionModalQuiz && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quiz Assessment Instructions"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xl space-y-4">
            <button
              onClick={() => setInstructionModalQuiz(null)}
              aria-label="Close dialog"
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {instructionModalQuiz.courseCode} · Instruction Overview
              </span>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-1">
                {instructionModalQuiz.title}
              </h2>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="leading-relaxed">{instructionModalQuiz.description}</p>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800 space-y-1.5 font-medium">
                <div>Duration: {instructionModalQuiz.durationMinutes} Minutes</div>
                <div>Questions: {instructionModalQuiz.questionsCount} Multiple Choice Items</div>
                <div>Total Points: {instructionModalQuiz.totalPoints} pts</div>
                <div>Attempts: {instructionModalQuiz.attemptsAllowed} Maximum</div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Assessment Rules:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>
                    The timer begins the moment you click &ldquo;Begin Quiz&rdquo; and cannot be
                    paused.
                  </li>
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
                onClick={() => {
                  const q = instructionModalQuiz;
                  setInstructionModalQuiz(null);
                  handleStartQuiz(q);
                }}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
              >
                Begin Quiz Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

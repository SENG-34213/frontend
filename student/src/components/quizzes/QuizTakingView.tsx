import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  AlertTriangle,
  Flag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { QuizResultModal } from "./QuizResultModal";

export const QuizTakingView: React.FC = () => {
  const { quizzes, selectedQuizId, submitQuizAnswers, setCurrentView, showToast } = useStudent();

  const quiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0];
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(quiz.durationMinutes * 60);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [resultsData, setResultsData] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
  } | null>(null);

  const handleAutoSubmit = useCallback(() => {
    showToast("Time expired! Auto-submitting answers.");
    const res = submitQuizAnswers(quiz.id, answers);
    setResultsData(res);
  }, [answers, quiz.id, showToast, submitQuizAnswers]);

  // Timer countdown
  useEffect(() => {
    if (resultsData) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [handleAutoSubmit, resultsData]);

  const currentQ = quiz.questions[currentQuestionIdx];

  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;
    if (currentQ.type === "multi-select") {
      const current = answers[currentQ.id] || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      setAnswers({ ...answers, [currentQ.id]: updated });
    } else {
      setAnswers({ ...answers, [currentQ.id]: [optionId] });
    }
  };

  const toggleFlag = () => {
    if (!currentQ) return;
    setFlaggedQuestions((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleConfirmSubmit = () => {
    setIsSubmitConfirmOpen(false);
    const res = submitQuizAnswers(quiz.id, answers);
    setResultsData(res);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).filter((k) => (answers[k]?.length ?? 0) > 0).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div>
          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {quiz.courseCode} · Live Assessment
          </span>
          <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {quiz.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold ${
              remainingSeconds < 300
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse"
                : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="tabular-nums">{formatTimer(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setIsSubmitConfirmOpen(true)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
          >
            Submit Quiz
          </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Question Area (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <span className="font-mono text-xs font-bold text-slate-400">
                Question {currentQuestionIdx + 1} of {quiz.questions.length} ({currentQ.points}{" "}
                Points)
              </span>

              <button
                onClick={toggleFlag}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  flaggedQuestions[currentQ.id]
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                <span>
                  {flaggedQuestions[currentQ.id] ? "Flagged for Review" : "Flag Question"}
                </span>
              </button>
            </div>

            {/* Question Text */}
            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.prompt}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id]?.includes(opt.id);
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-200 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {letter}
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Question Footer Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {currentQuestionIdx < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsSubmitConfirmOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Review & Finish</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Question Navigator
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIdx;
                const isAnswered = answers[q.id]?.length > 0;
                const isFlagged = flaggedQuestions[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs font-bold transition-all ${
                      isCurrent
                        ? "ring-2 ring-indigo-600 bg-indigo-600 text-white"
                        : isAnswered
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              <div className="flex items-center justify-between">
                <span>Answered:</span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                  {answeredCount} of {quiz.questions.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Flagged for Review:</span>
                <span className="font-bold tabular-nums text-amber-600">
                  {Object.values(flaggedQuestions).filter(Boolean).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {isSubmitConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Quiz Submission"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Submit Quiz Answers?
                </h3>
                <p className="text-xs text-slate-500">
                  You have answered {answeredCount} of {quiz.questions.length} questions.
                </p>
              </div>
            </div>

            {answeredCount < quiz.questions.length && (
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Warning: You have {quiz.questions.length - answeredCount} unanswered questions
                remaining.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Return to Questions
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {resultsData && (
        <QuizResultModal
          score={resultsData.score}
          maxScore={resultsData.maxScore}
          percentage={resultsData.percentage}
          quizTitle={quiz.title}
          onClose={() => setCurrentView("quizzes")}
          onRetake={() => {
            setAnswers({});
            setFlaggedQuestions({});
            setRemainingSeconds(quiz.durationMinutes * 60);
            setCurrentQuestionIdx(0);
            setResultsData(null);
          }}
        />
      )}
    </div>
  );
};

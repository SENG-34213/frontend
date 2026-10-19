"use client";
import React, { useEffect } from "react";
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, X } from "lucide-react";

interface QuizResultModalProps {
  score: number;
  maxScore: number;
  percentage: number;
  quizTitle: string;
  onClose: () => void;
  onRetake?: () => void;
}

export const QuizResultModal: React.FC<QuizResultModalProps> = ({
  score,
  maxScore,
  percentage,
  quizTitle,
  onClose,
  onRetake,
}) => {
  useEffect(() => {
    if (percentage >= 70 && typeof window !== "undefined") {
      import("canvas-confetti")
        .then((module) => {
          const runConfetti = module.default || module;
          runConfetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        })
        .catch(() => {});
    }
  }, [percentage]);

  const isPassed = percentage >= 70;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quiz Results"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-center space-y-5">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Award className="h-8 w-8" />
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quiz Assessment Completed
          </span>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
            {quizTitle}
          </h2>
        </div>

        {/* Score Ring Display */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="flex items-baseline gap-1 font-display">
            <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {score}
            </span>
            <span className="text-xl font-medium text-slate-400">/ {maxScore}</span>
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isPassed
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
            }`}
          >
            {isPassed ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Passed with {percentage}%
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                Needs Review ({percentage}%)
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {isPassed
            ? "Outstanding work! Your score has been officially logged to your academic course record and gradebook."
            : "You did not meet the recommended 70% mastery threshold. Review the lecture slides and attempt the quiz again."}
        </p>

        <div className="flex items-center gap-3 pt-2">
          {onRetake && !isPassed && (
            <button
              onClick={onRetake}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Back to Course
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

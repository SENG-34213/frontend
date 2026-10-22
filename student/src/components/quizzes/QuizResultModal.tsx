import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, X } from "lucide-react";
import type { QuizAnswerReview } from "../../types";

interface QuizResultModalProps {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  quizTitle: string;
  answers: QuizAnswerReview[];
  onClose: () => void;
  onRetake?: () => void;
}

export const QuizResultModal: React.FC<QuizResultModalProps> = ({
  score,
  maxScore,
  percentage,
  passed,
  quizTitle,
  answers,
  onClose,
  onRetake,
}) => {
  useEffect(() => {
    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback if canvas is unavailable
      }
    }
  }, [percentage]);

  const isPassed = passed;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quiz Results"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-center space-y-5">
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
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1">
            {quizTitle}
          </h2>
        </div>

        {/* Score Ring / Block */}
        <div className="rounded-xl bg-slate-50 p-6 dark:bg-slate-800/60 space-y-1">
          <div className="font-display text-4xl font-extrabold tabular-nums text-slate-900 dark:text-white">
            {score} <span className="text-xl text-slate-400 font-normal">/ {maxScore}</span>
          </div>
          <div
            className={`text-sm font-bold ${
              isPassed
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {percentage}% · {isPassed ? "Passed with Distinction" : "Needs Review"}
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {isPassed
            ? "Outstanding work! Your results have been officially recorded in your Mentify gradebook."
            : "Your result has been recorded. Review the course material before your next attempt."}
        </p>

        {answers.length > 0 && (
          <section className="space-y-3 text-left border-t border-slate-100 pt-5 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Answer review</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Review your answer, the correct answer, and the explanation for each question.
              </p>
            </div>
            <div className="space-y-3">
              {answers.map((answer, index) => (
                <article
                  key={answer.questionId || index}
                  className={`rounded-xl border p-4 ${
                    answer.correct
                      ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                      : "border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {answer.correct ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-xs font-bold leading-relaxed text-slate-900 dark:text-white">
                          {index + 1}. {answer.questionText}
                        </h4>
                        <span className="shrink-0 text-[10px] font-semibold text-slate-500">
                          {answer.awardedMarks}/{answer.questionMarks} pts
                        </span>
                      </div>
                      <dl className="mt-3 space-y-1.5 text-xs">
                        <div className="flex gap-2">
                          <dt className="font-semibold text-slate-500 dark:text-slate-400">
                            Your answer:
                          </dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200">
                            {answer.selectedAnswer || "Not answered"}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Correct answer:
                          </dt>
                          <dd className="font-medium text-emerald-800 dark:text-emerald-300">
                            {answer.correctAnswer || "Unavailable"}
                          </dd>
                        </div>
                      </dl>
                      {answer.explanation && (
                        <div className="mt-3 rounded-lg bg-white/70 p-3 text-xs leading-relaxed text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            Explanation:{" "}
                          </span>
                          {answer.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center gap-3 pt-2">
          {onRetake && (
            <button
              onClick={onRetake}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retake Quiz</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
          >
            <span>Return to Quizzes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

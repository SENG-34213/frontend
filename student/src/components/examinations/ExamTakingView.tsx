import React, { useState, useEffect } from "react";
import {
  Clock,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Flag,
  AlertTriangle,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";

export const ExamTakingView: React.FC = () => {
  const { examinations, selectedExamId, submitExam, setCurrentView, showToast } = useStudent();
  const exam = examinations.find((e) => e.id === selectedExamId) || examinations[0];

  const questions = exam.questions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(exam.durationMinutes * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isHonorAccepted, setIsHonorAccepted] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQ = questions[currentIdx] || {
    id: "eq1",
    prompt:
      "Prove the runtime of Dijkstra's algorithm when using a Fibonacci heap compared to a standard binary heap.",
    type: "multiple-choice",
    options: [
      {
        id: "opt-1",
        text: "Fibonacci heap runs in O(E + V log V); for dense graphs O(E) dominates and runs in O(V^2).",
      },
      {
        id: "opt-2",
        text: "Binary heap runs in O(E log V); it is strictly faster in all topological graphs.",
      },
    ],
    correctAnswerIds: ["opt-1"],
    points: 25,
  };

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSelect = (optionId: string) => {
    setAnswers({ ...answers, [currentQ.id]: [optionId] });
  };

  const handleFinishExam = () => {
    submitExam(exam.id, answers);
    setIsSubmitModalOpen(false);
    setCurrentView("examinations");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Exam Proctor Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-900 bg-slate-950 p-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Proctored Secure Session · Student ID: Verified</span>
            </div>
            <h1 className="font-display text-sm sm:text-base font-bold truncate">
              {exam.courseCode}: {exam.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 font-mono text-xs font-bold text-white">
            <Clock className="h-4 w-4 text-rose-400" />
            <span className="tabular-nums">{formatTimer(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
          >
            Finalize Examination
          </button>
        </div>
      </div>

      {/* Main Exam Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <span className="font-mono text-xs font-bold text-slate-400">
                Examination Question {currentIdx + 1} of {questions.length || 2} (
                {currentQ.points || 25} Marks)
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Autosaved</span>
              </span>
            </div>

            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.prompt}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, i) => {
                const isSelected = answers[currentQ.id]?.includes(opt.id);
                const letter = String.fromCharCode(65 + i);

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-200 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
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

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous Question</span>
              </button>

              {currentIdx < (questions.length || 2) - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-2xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Finalize & Submit Exam</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Exam Navigation Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Exam Sections
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {(questions.length > 0 ? questions : [{ id: "eq1" }, { id: "eq2" }]).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                    i === currentIdx
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Academic Honor Code
              </span>
              <p>
                You have attested that all submitted work is your own without unauthorized
                collaboration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {isSubmitModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Exam Finalization"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Finalize Examination?
                </h3>
                <p className="text-xs text-slate-500">
                  Once submitted, your responses are sealed and routed to the faculty grading queue.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Back to Exam
              </button>
              <button
                onClick={handleFinishExam}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-2xs"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

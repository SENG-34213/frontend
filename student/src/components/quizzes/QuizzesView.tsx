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
  Filter,
  LockKeyhole,
  TimerReset,
  Eye,
  Grid2X2,
  List,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { Quiz, QuizAnswerReview } from "../../types";
import { QuizResultModal } from "./QuizResultModal";

export const QuizzesView: React.FC = () => {
  const { quizzes, courses, profile, setSelectedQuizId, setCurrentView } = useStudent();
  const [activeTab, setActiveTab] = useState<"AVAILABLE" | "COMPLETED" | "ALL">("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [instructionModalQuiz, setInstructionModalQuiz] = useState<Quiz | null>(null);
  const [resultQuiz, setResultQuiz] = useState<{
    quiz: Quiz;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    answers: QuizAnswerReview[];
  } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const quizState = (quiz: Quiz) => {
    const attemptsExhausted =
      (quiz.attemptsAllowed ?? 0) > 0 && (quiz.attemptsUsed ?? 0) >= (quiz.attemptsAllowed ?? 0);
    if (quiz.status === "COMPLETED" || attemptsExhausted) return "completed" as const;
    const startAt = quiz.startTime ? Date.parse(quiz.startTime) : NaN;
    const endAt = quiz.dueDate ? Date.parse(quiz.dueDate) : NaN;
    if (Number.isFinite(endAt) && endAt <= now) return "closed" as const;
    if (Number.isFinite(startAt) && startAt > now) return "upcoming" as const;
    if (quiz.status === "UPCOMING") return "upcoming" as const;
    return "available" as const;
  };

  const countdown = (quiz: Quiz) => {
    const state = quizState(quiz);
    if (state === "closed" || state === "completed") return null;
    const target = state === "upcoming" ? quiz.startTime : quiz.dueDate;
    if (!target) return null;
    const seconds = Math.max(0, Math.floor((Date.parse(target) - now) / 1000));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const value = days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m ${secs}s`;
    return { label: state === "upcoming" ? "Starts in" : "Closes in", value };
  };

  const displayedQuizzes = quizzes
    .filter((q) => {
      if (activeTab === "ALL") return true;
      return activeTab === "AVAILABLE"
        ? quizState(q) === "available" || quizState(q) === "upcoming"
        : quizState(q) === "completed";
    })
    .filter((q) => courseFilter === "ALL" || q.courseId === courseFilter);

  const handleStartQuiz = (quiz: Quiz) => {
    if (quizState(quiz) !== "available") return;
    setSelectedQuizId(quiz.id);
    setInstructionModalQuiz(null);
    setCurrentView("quiz-taking");
  };

  const handleViewResult = (quiz: Quiz) => {
    const raw = window.localStorage.getItem(`student:quiz-result:${profile.id}:${quiz.id}`);
    if (!raw) {
      setInstructionModalQuiz(quiz);
      return;
    }
    try {
      const result = JSON.parse(raw);
      setResultQuiz({ ...result, quiz });
    } catch {
      setInstructionModalQuiz(quiz);
    }
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
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-1 text-xs font-semibold">
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
        <label className="relative flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          <span className="sr-only">Filter by course</span>
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} · {course.title}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className={`rounded-lg p-1.5 ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            <Grid2X2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={`rounded-lg p-1.5 ${viewMode === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Quiz Cards */}
      <div
        className={
          viewMode === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"
        }
      >
        {viewMode === "list" && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-bold">Quiz</th>
                  <th className="px-4 py-3 font-bold">Course</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Duration</th>
                  <th className="px-4 py-3 font-bold">Attempts</th>
                  <th className="px-4 py-3 font-bold">Schedule</th>
                  <th className="px-5 py-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedQuizzes.map((quiz) => {
                  const state = quizState(quiz);
                  const isCompleted = state === "completed";
                  const isClosed = state === "closed";
                  const timer = countdown(quiz);
                  return (
                    <tr
                      key={quiz.id}
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <div className="max-w-[260px]">
                          <p className="font-bold text-slate-900 dark:text-white">{quiz.title}</p>
                          <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {quiz.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {quiz.courseCode}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isCompleted ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : isClosed ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"}`}
                        >
                          {isCompleted
                            ? "Completed"
                            : isClosed
                              ? "Closed"
                              : state === "upcoming"
                                ? "Upcoming"
                                : "Available"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {quiz.durationMinutes} min
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {quiz.attemptsUsed ?? 0} / {quiz.attemptsAllowed ?? "—"}
                      </td>
                      <td
                        className={`px-4 py-4 whitespace-nowrap text-[11px] font-semibold ${timer && state === "available" ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}
                      >
                        {isClosed
                          ? "Closed"
                          : isCompleted
                            ? "Finished"
                            : timer
                              ? `${timer.label}: ${timer.value}`
                              : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isCompleted ? (
                          <button
                            onClick={() => handleViewResult(quiz)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                          >
                            <Eye className="h-3.5 w-3.5" /> Results
                          </button>
                        ) : isClosed ? (
                          <button
                            disabled
                            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                          >
                            <LockKeyhole className="h-3.5 w-3.5" /> Closed
                          </button>
                        ) : state === "upcoming" ? (
                          <button
                            onClick={() => setInstructionModalQuiz(quiz)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-2 font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300"
                          >
                            <Eye className="h-3.5 w-3.5" /> Details
                          </button>
                        ) : (
                          <button
                            onClick={() => setInstructionModalQuiz(quiz)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white hover:bg-indigo-700"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Start
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {viewMode === "grid" &&
          displayedQuizzes.map((quiz) => {
            const state = quizState(quiz);
            const isCompleted = state === "completed";
            const isClosed = state === "closed";
            const timer = countdown(quiz);

            return (
              <div
                key={quiz.id}
                className={`flex ${viewMode === "grid" ? "flex-col" : "flex-col md:flex-row md:items-center md:gap-6"} justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700`}
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
                      {isCompleted
                        ? "Completed"
                        : isClosed
                          ? "Closed"
                          : state === "upcoming"
                            ? "Upcoming"
                            : "Available"}
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
                        {quiz.attemptsUsed ?? "—"} of {quiz.attemptsAllowed ?? "—"} used
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
                    {!isCompleted && !isClosed && timer && (
                      <div
                        className={`mt-2 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold ${state === "available" ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"}`}
                      >
                        <TimerReset className="h-3.5 w-3.5" />
                        <span>
                          {timer.label}: {timer.value}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {isCompleted ? (
                    <button
                      onClick={() => handleViewResult(quiz)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Results</span>
                    </button>
                  ) : isClosed ? (
                    <button
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                    >
                      <LockKeyhole className="h-3.5 w-3.5" />
                      <span>Quiz Closed</span>
                    </button>
                  ) : state === "upcoming" ? (
                    <button
                      onClick={() => setInstructionModalQuiz(quiz)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Quiz Details</span>
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
                  <li>
                    The timer begins the moment you click &quot;Begin Quiz&quot; and cannot be
                    paused.
                  </li>
                  <li>You may flag questions and return to them using the question palette.</li>
                  <li>Answers are saved automatically while you work.</li>
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
                disabled={quizState(instructionModalQuiz) !== "available"}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {quizState(instructionModalQuiz) === "available"
                  ? "Begin Quiz"
                  : quizState(instructionModalQuiz) === "closed"
                    ? "Quiz Closed"
                    : "Not Started Yet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {resultQuiz && (
        <QuizResultModal
          score={resultQuiz.score}
          maxScore={resultQuiz.maxScore}
          percentage={resultQuiz.percentage}
          passed={resultQuiz.passed}
          answers={resultQuiz.answers}
          quizTitle={resultQuiz.quiz.title}
          onClose={() => setResultQuiz(null)}
        />
      )}
    </div>
  );
};

import React, { useEffect, useState } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  BarChart3,
  ChevronRight,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Course, Quiz, QuizQuestion, NavigationTab } from "../types";
import {
  createQuizQuestion,
  deleteQuiz,
  deleteQuizQuestion,
  getTodayQuizAnalytics,
  publishQuiz,
  updateQuiz,
  updateQuizQuestion,
  type BackendQuiz,
  type BackendQuizQuestion,
  type QuizAnalytics,
} from "../api/quizApi";
import { useTeacherQuizzes } from "../hooks/useTeacherQuizzes";
import { StatusBadge } from "../components/StatusBadge";
import { QuestionBuilderModal } from "./QuestionBuilderModal";

interface QuizDashboardViewProps {
  teacherCourses: Course[];
  onOpenCreateQuiz: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenAIWithPrompt: (prompt: string) => void;
}

export const QuizDashboardView: React.FC<QuizDashboardViewProps> = ({
  teacherCourses,
  onOpenCreateQuiz,
  onNavigate,
  onOpenAIWithPrompt,
}) => {
  const teacherQuizState = useTeacherQuizzes(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQuestionBuilderOpen, setIsQuestionBuilderOpen] = useState(false);
  const [todayAnalytics, setTodayAnalytics] = useState<QuizAnalytics | null>(null);
  const [analyticsUnavailable, setAnalyticsUnavailable] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getTodayQuizAnalytics(controller.signal)
      .then((analytics) => {
        if (!controller.signal.aborted) {
          setTodayAnalytics(analytics ?? null);
          setAnalyticsUnavailable(!analytics);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setAnalyticsUnavailable(true);
      });

    return () => controller.abort();
  }, []);

  const averageTodayScore = todayAnalytics?.quizzes.length
    ? Math.round(
        todayAnalytics.quizzes.reduce((total, quiz) => total + (quiz.averagePercentage ?? 0), 0) /
          todayAnalytics.quizzes.length,
      )
    : null;

  useEffect(() => {
    const mappedQuizzes = teacherQuizState.quizzes.map((quiz) =>
      mapBackendQuiz(quiz, teacherCourses),
    );
    setQuizzes(mappedQuizzes);
    setSelectedQuiz((current) =>
      current
        ? (mappedQuizzes.find((quiz) => quiz.id === current.id) ?? null)
        : (mappedQuizzes[0] ?? null),
    );
  }, [teacherCourses, teacherQuizState.quizzes]);

  const filtered = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === "All" || q.courseId === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const appendQuestion = (newQuestion: QuizQuestion) => {
    if (!selectedQuiz) return;
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === selectedQuiz.id
          ? {
              ...q,
              questions: [...q.questions, newQuestion],
              totalQuestions: q.totalQuestions + 1,
              totalMarks: q.totalMarks + newQuestion.marks,
            }
          : q,
      ),
    );
    setSelectedQuiz((prev) =>
      prev
        ? {
            ...prev,
            questions: [...prev.questions, newQuestion],
            totalQuestions: prev.totalQuestions + 1,
            totalMarks: prev.totalMarks + newQuestion.marks,
          }
        : null,
    );
  };

  const handleSaveQuestion = async (newQuestion: QuizQuestion) => {
    if (!selectedQuiz || newQuestion.type !== "multiple-choice" || !newQuestion.options?.length) {
      setActionError("Only multiple-choice questions are supported by the quiz service.");
      throw new Error("Only multiple-choice questions are supported by the quiz service.");
    }
    try {
      const created = await createQuizQuestion(selectedQuiz.id, {
        questionText: newQuestion.question,
        questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER",
        marks: newQuestion.marks,
        questionOrder: selectedQuiz.questions.length + 1,
        options: newQuestion.options.map((option, index) => ({
          optionText: option,
          correct: option === newQuestion.correctAnswer,
          optionOrder: index + 1,
        })),
      });
      appendQuestion(mapBackendQuestion(created, selectedQuiz.id));
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Question could not be saved.",
      );
      throw requestError;
    }
  };

  const handlePublishQuiz = async () => {
    if (!selectedQuiz || selectedQuiz.status !== "Draft") return;
    try {
      const published = await publishQuiz(selectedQuiz.id);
      const mapped = mapBackendQuiz(published, teacherCourses);
      setQuizzes((current) => current.map((quiz) => (quiz.id === mapped.id ? mapped : quiz)));
      setSelectedQuiz(mapped);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Quiz could not be published.",
      );
    }
  };

  const handleEditQuiz = async () => {
    if (!selectedQuiz || selectedQuiz.status !== "Draft") return;
    const title = window.prompt("Quiz title", selectedQuiz.title)?.trim();
    if (!title || title === selectedQuiz.title) return;
    try {
      const updated = await updateQuiz(selectedQuiz.id, {
        title,
        description: selectedQuiz.description,
        durationMinutes: selectedQuiz.durationMinutes,
        passMark: 0,
        maxAttempts: 1,
        showResultImmediately: true,
      });
      const mapped = mapBackendQuiz(updated, teacherCourses);
      setQuizzes((current) => current.map((quiz) => (quiz.id === mapped.id ? mapped : quiz)));
      setSelectedQuiz(mapped);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Quiz could not be updated.",
      );
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz || !window.confirm(`Delete ${selectedQuiz.title}?`)) return;
    try {
      await deleteQuiz(selectedQuiz.id);
      const remaining = quizzes.filter((quiz) => quiz.id !== selectedQuiz.id);
      setQuizzes(remaining);
      setSelectedQuiz(remaining[0] ?? null);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Quiz could not be deleted.",
      );
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedQuiz || !window.confirm("Delete this question?")) return;
    try {
      await deleteQuizQuestion(selectedQuiz.id, questionId);
      const updated = {
        ...selectedQuiz,
        questions: selectedQuiz.questions.filter((q) => q.id !== questionId),
      };
      setSelectedQuiz(updated);
      setQuizzes((current) => current.map((quiz) => (quiz.id === updated.id ? updated : quiz)));
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Question could not be deleted.",
      );
    }
  };

  const handleEditQuestion = async (question: QuizQuestion) => {
    if (!selectedQuiz || selectedQuiz.status !== "Draft") return;
    const questionText = window.prompt("Question text", question.question)?.trim();
    if (!questionText || questionText === question.question || !question.options?.length) return;
    try {
      const updated = await updateQuizQuestion(selectedQuiz.id, question.id, {
        questionText,
        questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER",
        marks: question.marks,
        questionOrder: selectedQuiz.questions.indexOf(question) + 1,
        options: question.options.map((option, index) => ({
          optionText: option,
          correct: option === question.correctAnswer,
          optionOrder: index + 1,
        })),
      });
      const mapped = mapBackendQuestion(updated, selectedQuiz.id);
      const next = {
        ...selectedQuiz,
        questions: selectedQuiz.questions.map((item) => (item.id === question.id ? mapped : item)),
      };
      setSelectedQuiz(next);
      setQuizzes((current) => current.map((quiz) => (quiz.id === next.id ? next : quiz)));
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Question could not be updated.",
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Quiz Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure diagnostic assessments, question banks, automated grading, and concept
            retention checks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenAIWithPrompt(
                "Generate 5 conceptual multiple-choice questions for CS-201 on AVL Tree balance factors",
              )
            }
            className="px-3.5 py-2 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>AI Question Generator</span>
          </button>
          <button
            onClick={onOpenCreateQuiz}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {actionError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {actionError}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Quizzes</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {teacherQuizState.isLoading ? "—" : quizzes.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across active courses</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Active This Week</span>
          <div className="text-2xl font-bold text-indigo-600 font-mono mt-1 tabular-nums">
            {teacherQuizState.isLoading
              ? "—"
              : quizzes.filter((quiz) => quiz.status === "Active").length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Published quizzes</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Avg Class Score</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1 tabular-nums">
            {averageTodayScore === null ? "—" : `${averageTodayScore}%`}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {analyticsUnavailable ? "Analytics unavailable" : "Live analytics"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Completion Rate</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">—</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Attempt analytics coming later</p>
        </div>
      </div>

      {/* Main 2-Column Split: Quizzes List & Selected Quiz Question Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quiz Directory */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          {teacherQuizState.error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              <p className="font-semibold">Quizzes could not be loaded.</p>
              <p className="mt-1">{teacherQuizState.error.message}</p>
              <button
                type="button"
                onClick={teacherQuizState.retry}
                className="mt-3 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {teacherQuizState.isLoading && !teacherQuizState.error && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              Loading quizzes…
            </div>
          )}

          {!teacherQuizState.isLoading && !teacherQuizState.error && quizzes.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
              No quizzes have been created for your courses yet.
            </div>
          )}

          <div className="space-y-2.5">
            {filtered.map((quiz) => {
              const isSelected = selectedQuiz?.id === quiz.id;
              return (
                <div
                  key={quiz.id}
                  onClick={() => setSelectedQuiz(quiz)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {quiz.courseCode}
                    </span>
                    <StatusBadge status={quiz.status} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{quiz.description}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>
                      {quiz.totalQuestions} Questions · {quiz.totalMarks} Marks
                    </span>
                    <span className="text-indigo-600 font-semibold">
                      {quiz.averageScorePercent}% Avg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Quiz Question Breakdown & Questions Builder */}
        <div className="lg:col-span-7">
          {teacherQuizState.error ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Quiz details are unavailable until the quiz list loads.
            </div>
          ) : selectedQuiz ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-700">
                      {selectedQuiz.courseCode}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900">{selectedQuiz.title}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Duration: {selectedQuiz.durationMinutes} mins · Total Marks:{" "}
                    {selectedQuiz.totalMarks} · {selectedQuiz.attemptsCount} attempts
                  </p>
                </div>

                <button
                  onClick={() => setIsQuestionBuilderOpen(true)}
                  disabled={selectedQuiz.status !== "Draft"}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
                {selectedQuiz.status === "Draft" && (
                  <>
                    <button
                      onClick={() => void handleEditQuiz()}
                      className="text-xs text-slate-600 hover:text-indigo-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void handlePublishQuiz()}
                      className="text-xs text-emerald-700 hover:text-emerald-900"
                    >
                      Publish
                    </button>
                  </>
                )}
                {selectedQuiz.status === "Draft" && (
                  <button
                    onClick={() => void handleDeleteQuiz()}
                    className="text-xs text-rose-700 hover:text-rose-900"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Questions List */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Question Bank ({selectedQuiz.questions.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    Randomized for each student attempt
                  </span>
                </div>

                {selectedQuiz.questions.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 p-6">
                    <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      No questions configured yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click &quot;Add Question&quot; above or use Mentify AI to generate questions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedQuiz.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2.5 bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                                {q.question}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono uppercase mt-0.5 block">
                                {q.type.replace("-", " ")}
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shrink-0">
                            {q.marks} marks
                          </span>
                          <div className="flex gap-2 shrink-0">
                            {selectedQuiz.status === "Draft" && (
                              <button
                                onClick={() => void handleEditQuestion(q)}
                                className="text-[10px] text-slate-600 hover:text-indigo-600"
                              >
                                Edit
                              </button>
                            )}
                            {selectedQuiz.status === "Draft" && (
                              <button
                                onClick={() => void handleDeleteQuestion(q.id)}
                                className="text-[10px] text-rose-700 hover:text-rose-900"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Options */}
                        {q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-8">
                            {q.options.map((opt, oIdx) => {
                              const isCorrect = Array.isArray(q.correctAnswer)
                                ? q.correctAnswer.includes(opt)
                                : q.correctAnswer === opt;
                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-lg text-xs flex items-center gap-2 border ${
                                    isCorrect
                                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-900 font-medium"
                                      : "bg-slate-50 border-slate-200 text-slate-700"
                                  }`}
                                >
                                  {isCorrect ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                                  )}
                                  <span className="truncate">{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.explanation && (
                          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 pl-8 leading-relaxed">
                            <strong className="text-slate-700">Rationale: </strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Select a quiz to view question details
            </div>
          )}
        </div>
      </div>

      {/* Question Builder Modal */}
      {selectedQuiz && (
        <QuestionBuilderModal
          isOpen={isQuestionBuilderOpen}
          quizId={selectedQuiz.id}
          onClose={() => setIsQuestionBuilderOpen(false)}
          onSaveQuestion={handleSaveQuestion}
        />
      )}
    </div>
  );
};

function mapBackendQuiz(quiz: BackendQuiz, courses: Course[]): Quiz {
  const course = courses.find((item) => item.id === quiz.courseId);
  const questions = quiz.questions.map((question) => {
    const options = [...question.options].sort((a, b) => a.optionOrder - b.optionOrder);
    const correctAnswer = options.find((option) => option.correct)?.optionText ?? "";

    return {
      id: question.id,
      quizId: quiz.id,
      type: "multiple-choice" as const,
      question: question.questionText,
      options: options.map((option) => option.optionText),
      correctAnswer,
      explanation: "",
      marks: Number(question.marks),
    };
  });

  return {
    id: quiz.id,
    courseId: quiz.courseId,
    courseCode: course?.code || "COURSE",
    title: quiz.title,
    description: quiz.description || "No quiz description available.",
    durationMinutes: quiz.durationMinutes,
    totalQuestions: questions.length,
    totalMarks: Number(quiz.totalMarks),
    status:
      quiz.status === "PUBLISHED" ? "Active" : quiz.status === "CLOSED" ? "Completed" : "Draft",
    dueDate: quiz.endTime || quiz.startTime || "",
    attemptsCount: 0,
    totalEligible: course?.enrolledCount || 0,
    averageScorePercent: 0,
    questions,
  };
}

function mapBackendQuestion(question: BackendQuizQuestion, quizId: string): QuizQuestion {
  const options = [...question.options].sort((a, b) => a.optionOrder - b.optionOrder);
  return {
    id: question.id,
    quizId,
    type: "multiple-choice",
    question: question.questionText,
    options: options.map((option) => option.optionText),
    correctAnswer: options.find((option) => option.correct)?.optionText ?? "",
    explanation: "",
    marks: Number(question.marks),
  };
}

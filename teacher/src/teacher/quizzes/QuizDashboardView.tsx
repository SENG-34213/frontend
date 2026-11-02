import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Layers,
  Sparkles,
  BookOpen,
  Trash2,
  Send,
  Eye,
  Users,
  ClipboardCheck,
  Award,
  ChevronDown,
  RefreshCw,
  LayoutGrid,
  List,
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
  getTeacherQuizResults,
  type BackendQuiz,
  type BackendQuizQuestion,
  type QuizAnalytics,
  type AiQuizDraft,
  type TeacherQuizResults,
} from "../api/quizApi";
import { useTeacherQuizzes } from "../hooks/useTeacherQuizzes";
import { getStudentProfiles } from "../api/studentApi";
import { StatusBadge } from "../components/StatusBadge";
import { QuestionBuilderModal } from "./QuestionBuilderModal";
import { CreateQuizModal } from "./CreateQuizModal";
import { AiQuizGeneratorCard } from "./AiQuizGeneratorCard";
import { AiQuizCardSliderModal } from "./AiQuizCardSliderModal";
import { ConfirmModal, TextInputModal } from "../components/ActionModal";

interface QuizDashboardViewProps {
  teacherCourses: Course[];
  onOpenCreateQuiz: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const QuizDashboardView: React.FC<QuizDashboardViewProps> = ({
  teacherCourses,
  onNavigate,
}) => {
  const teacherQuizState = useTeacherQuizzes(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Draft" | "Active" | "Completed">("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQuestionBuilderOpen, setIsQuestionBuilderOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [sliderPreviewQuiz, setSliderPreviewQuiz] = useState<Quiz | null>(null);
  const [todayAnalytics, setTodayAnalytics] = useState<QuizAnalytics | null>(null);
  const [analyticsUnavailable, setAnalyticsUnavailable] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [isDeleteQuizOpen, setIsDeleteQuizOpen] = useState(false);
  const [quizPanel, setQuizPanel] = useState<"overview" | "questions" | "results">("overview");
  const [quizResults, setQuizResults] = useState<TeacherQuizResults | null>(null);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [selectedStudentResultId, setSelectedStudentResultId] = useState<string | null>(null);
  const [studentNumbers, setStudentNumbers] = useState<Record<string, string>>({});
  const [questionPage, setQuestionPage] = useState(0);
  const questionsPerPage = 5;

  useEffect(() => {
    const studentIds = Array.from(
      new Set((quizResults?.results ?? []).map((result) => result.studentId).filter(Boolean)),
    );
    if (studentIds.length === 0) {
      setStudentNumbers({});
      return;
    }
    const controller = new AbortController();
    getStudentProfiles(studentIds, controller.signal)
      .then((profiles) => {
        if (controller.signal.aborted) return;
        setStudentNumbers(
          Object.fromEntries(
            profiles
              .filter((profile) => profile.studentNumber)
              .map((profile) => [profile.id, profile.studentNumber as string]),
          ),
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setStudentNumbers({});
      });
    return () => controller.abort();
  }, [quizResults]);

  useEffect(() => {
    if (!isAiGeneratorOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAiGeneratorOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isAiGeneratorOpen]);

  const loadTodayAnalytics = useCallback(async (signal?: AbortSignal) => {
    setAnalyticsLoading(true);
    setAnalyticsError(false);
    try {
      const analytics = await getTodayQuizAnalytics(signal);
      if (!signal?.aborted) {
        setTodayAnalytics(analytics ?? null);
        setAnalyticsUnavailable(!analytics);
      }
    } catch {
      if (!signal?.aborted) {
        setAnalyticsUnavailable(true);
        setAnalyticsError(true);
      }
    } finally {
      if (!signal?.aborted) setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const initialLoad = window.setTimeout(() => {
      void loadTodayAnalytics(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(initialLoad);
      controller.abort();
    };
  }, [loadTodayAnalytics]);

  const averageTodayScore = (() => {
    const scores =
      todayAnalytics?.quizzes.flatMap((quiz) => {
        const score = quiz.averagePercentage;
        return score == null || !Number.isFinite(score) ? [] : [score];
      }) ?? [];
    return scores.length
      ? Math.round(
          Math.min(
            100,
            Math.max(0, scores.reduce((total, score) => total + score, 0) / scores.length),
          ),
        )
      : null;
  })();
  const todayAttemptTotals = todayAnalytics?.quizzes.reduce(
    (totals, quiz) => ({
      submitted: totals.submitted + quiz.submittedAttempts,
      participants: totals.participants + quiz.participants,
      passed: totals.passed + quiz.passedAttempts,
    }),
    { submitted: 0, participants: 0, passed: 0 },
  );
  const completionRate = todayAttemptTotals?.participants
    ? Math.round((todayAttemptTotals.submitted / todayAttemptTotals.participants) * 100)
    : null;
  const passRate = todayAttemptTotals?.submitted
    ? Math.round((todayAttemptTotals.passed / todayAttemptTotals.submitted) * 100)
    : null;

  useEffect(() => {
    const mappedQuizzes = teacherQuizState.quizzes.map((quiz) =>
      mapBackendQuiz(quiz, teacherCourses),
    );
    setQuizzes(mappedQuizzes);
    setSelectedQuiz((current) =>
      current ? (mappedQuizzes.find((quiz) => quiz.id === current.id) ?? null) : null,
    );
  }, [teacherCourses, teacherQuizState.quizzes]);

  useEffect(() => {
    if (courseFilter === "All" && gradeFilter === "All") return;
    setSelectedQuiz((current) =>
      current &&
      (courseFilter === "All" || current.courseId === courseFilter) &&
      (gradeFilter === "All" ||
        teacherCourses.find((course) => course.id === current.courseId)?.gradeName?.trim() ===
          gradeFilter)
        ? current
        : null,
    );
    setQuizPanel("overview");
  }, [courseFilter, gradeFilter, teacherCourses]);

  useEffect(() => {
    if (quizPanel !== "results" || !selectedQuiz) return;
    const controller = new AbortController();
    setIsResultsLoading(true);
    setResultsError(null);
    setSelectedStudentResultId(null);
    getTeacherQuizResults(selectedQuiz.id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setQuizResults(data);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setQuizResults(null);
          setResultsError(
            requestError instanceof Error
              ? requestError.message
              : "Quiz results could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsResultsLoading(false);
      });
    return () => controller.abort();
  }, [quizPanel, selectedQuiz]);

  const gradeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          teacherCourses
            .map((course) => course.gradeName?.trim())
            .filter((grade): grade is string => Boolean(grade)),
        ),
      ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [teacherCourses],
  );
  const coursesForGrade = useMemo(
    () =>
      teacherCourses.filter(
        (course) => gradeFilter === "All" || course.gradeName?.trim() === gradeFilter,
      ),
    [teacherCourses, gradeFilter],
  );

  const filtered = quizzes.filter((q) => {
    const course = teacherCourses.find((item) => item.id === q.courseId);
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      (q.courseTitle ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesGrade = gradeFilter === "All" || course?.gradeName?.trim() === gradeFilter;
    const matchesCourse = courseFilter === "All" || q.courseId === courseFilter;
    const matchesStatus = statusFilter === "All" || q.status === statusFilter;
    return matchesSearch && matchesGrade && matchesCourse && matchesStatus;
  });

  const totalQuestionPages = selectedQuiz
    ? Math.max(1, Math.ceil(selectedQuiz.questions.length / questionsPerPage))
    : 1;
  const visibleQuestions = selectedQuiz
    ? selectedQuiz.questions.slice(
        questionPage * questionsPerPage,
        questionPage * questionsPerPage + questionsPerPage,
      )
    : [];

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
        explanation: newQuestion.explanation,
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

  const handleEditQuiz = async (title: string) => {
    if (!editingQuiz || editingQuiz.status !== "Draft") return;
    if (title === editingQuiz.title) {
      setEditingQuiz(null);
      return;
    }
    try {
      const updated = await updateQuiz(editingQuiz.id, {
        title,
        description: editingQuiz.description,
        durationMinutes: editingQuiz.durationMinutes,
        passMark: 0,
        maxAttempts: 1,
        showResultImmediately: true,
      });
      const mapped = mapBackendQuiz(updated, teacherCourses);
      setQuizzes((current) => current.map((quiz) => (quiz.id === mapped.id ? mapped : quiz)));
      setSelectedQuiz(mapped);
      setEditingQuiz(null);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Quiz could not be updated.",
      );
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;
    try {
      await deleteQuiz(selectedQuiz.id);
      const remaining = quizzes.filter((quiz) => quiz.id !== selectedQuiz.id);
      setQuizzes(remaining);
      setSelectedQuiz(remaining[0] ?? null);
      setIsDeleteQuizOpen(false);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Quiz could not be deleted.",
      );
    }
  };

  const handleDeleteQuestion = async () => {
    const questionId = deletingQuestionId;
    if (!selectedQuiz || !questionId) return;
    try {
      await deleteQuizQuestion(selectedQuiz.id, questionId);
      const updated = {
        ...selectedQuiz,
        questions: selectedQuiz.questions.filter((q) => q.id !== questionId),
      };
      setSelectedQuiz(updated);
      setQuizzes((current) => current.map((quiz) => (quiz.id === updated.id ? updated : quiz)));
      setDeletingQuestionId(null);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Question could not be deleted.",
      );
    }
  };

  const handleEditQuestion = async (questionText: string) => {
    const question = editingQuestion;
    if (!selectedQuiz || !question || selectedQuiz.status !== "Draft") return;
    if (questionText === question.question || !question.options?.length) {
      setEditingQuestion(null);
      return;
    }
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
      setEditingQuestion(null);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : "Question could not be updated.",
      );
    }
  };

  return (
    <div className="mx-auto min-h-full max-w-[1500px] space-y-8 pb-16">
      {!selectedQuiz && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              Assessments
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Quizzes
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAiGeneratorOpen((current) => !current)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${isAiGeneratorOpen ? "border-violet-400 bg-violet-600 text-white shadow-lg" : "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isAiGeneratorOpen ? "Hide AI builder" : "Build with AI"}</span>
            </button>
            <button
              onClick={() => setIsCreateQuizOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {actionError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {actionError}
        </div>
      )}
      {!selectedQuiz && isAiGeneratorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-quiz-generator-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAiGeneratorOpen(false);
          }}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-indigo-200/70 bg-white shadow-2xl shadow-slate-950/30 dark:border-slate-700 dark:bg-slate-900"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
                  Assisted quiz creation
                </p>
                <h2
                  id="ai-quiz-generator-title"
                  className="mt-1 text-base font-bold text-slate-900 dark:text-white"
                >
                  Build a quiz with AI
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Upload course material and review the generated questions before saving.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAiGeneratorOpen(false)}
                aria-label="Close AI quiz creator"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
            <AiQuizGeneratorCard
              courses={teacherCourses}
              onQuizCreated={(createdQuiz) => {
                const mapped = mapBackendQuiz(createdQuiz, teacherCourses);
                setQuizzes((current) => [
                  mapped,
                  ...current.filter((quiz) => quiz.id !== mapped.id),
                ]);
                setIsAiGeneratorOpen(false);
                setSelectedQuiz(mapped);
              }}
            />
          </div>
        </div>
      )}
      {!selectedQuiz && (
        <>
          <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                    Course focus
                  </p>
                  <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                    Set your teaching context
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Filter the workspace by course when you want a tighter view of your assessments.
                  </p>
                </div>
              </div>
              <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-[620px]">
                <label className="relative block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Grade
                  </span>
                  <select
                    id="quiz-grade-filter"
                    value={gradeFilter}
                    onChange={(event) => {
                      setGradeFilter(event.target.value);
                      setCourseFilter("All");
                    }}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3.5 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
                    aria-label="Filter quizzes by grade"
                  >
                    <option value="All">All grades</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 bottom-3.5 h-4 w-4 text-slate-400" />
                </label>
                <label className="relative block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Course
                  </span>
                  <select
                    id="quiz-course-filter"
                    value={courseFilter}
                    onChange={(event) => setCourseFilter(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3.5 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
                    aria-label="Filter quizzes by course"
                  >
                    <option value="All">All courses</option>
                    {coursesForGrade.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code ? `${course.code} · ` : ""}
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 bottom-3.5 h-4 w-4 text-slate-400" />
                </label>
              </div>
            </div>
          </section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_25px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs text-slate-500 font-medium">Total Quizzes</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums dark:text-white">
                {teacherQuizState.isLoading ? "—" : quizzes.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Across active courses</p>
            </div>

            <div className="rounded-[22px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-[0_10px_25px_rgba(79,70,229,0.08)] dark:border-indigo-900/70 dark:from-indigo-950/60 dark:to-slate-900">
              <span className="text-xs text-slate-500 font-medium">Active This Week</span>
              <div className="text-2xl font-bold text-indigo-600 font-mono mt-1 tabular-nums">
                {teacherQuizState.isLoading
                  ? "—"
                  : quizzes.filter((quiz) => quiz.status === "Active").length}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Published quizzes</p>
            </div>

            <div className="rounded-[22px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-[0_10px_25px_rgba(16,185,129,0.08)] dark:border-emerald-900/70 dark:from-emerald-950/50 dark:to-slate-900">
              <span className="text-xs text-slate-500 font-medium">Avg Class Score</span>
              <div className="text-2xl font-bold text-emerald-600 font-mono mt-1 tabular-nums">
                {averageTodayScore === null ? "—" : `${averageTodayScore}%`}
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                {analyticsUnavailable ? "Analytics unavailable" : "Live analytics"}
              </p>
            </div>

            <div className="rounded-[22px] border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-[0_10px_25px_rgba(139,92,246,0.08)] dark:border-violet-900/70 dark:from-violet-950/50 dark:to-slate-900">
              <span className="text-xs text-slate-500 font-medium">Completion Rate</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums dark:text-white">
                {completionRate === null ? "—" : `${completionRate}%`}
              </div>
              <p className="text-[11px] text-violet-700 font-medium mt-0.5">
                {passRate === null
                  ? "No submitted attempts"
                  : `${passRate}% passed submitted attempts`}
              </p>
            </div>
            <div className="hidden">
              <span className="text-xs text-slate-500 font-medium">Completion Rate</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">—</div>
              <p className="text-[11px] text-violet-700 font-medium mt-0.5">
                {passRate === null
                  ? "No submitted attempts"
                  : `${passRate}% passed submitted attempts`}
              </p>
            </div>
          </div>
        </>
      )}

      {false && !selectedQuiz && todayAnalytics && (
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)] sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                Live assessment analytics
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Today&apos;s quiz performance
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {todayAnalytics?.date
                  ? `Results for ${todayAnalytics?.date}`
                  : "No daily results loaded"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(analyticsUnavailable || analyticsError) && (
                <button
                  type="button"
                  onClick={() => void loadTodayAnalytics()}
                  disabled={analyticsLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${analyticsLoading ? "animate-spin" : ""}`} />
                  Retry
                </button>
              )}
              <BarChart3 className="h-5 w-5 shrink-0 text-indigo-600" />
            </div>
          </div>
          {todayAnalytics?.quizzes.length ? (
            <div className="space-y-3">
              {todayAnalytics?.quizzes?.map((quiz) => {
                const quizCompletion = quiz.participants
                  ? Math.round((quiz.submittedAttempts / quiz.participants) * 100)
                  : null;
                const quizPassRate = quiz.submittedAttempts
                  ? Math.round((quiz.passedAttempts / quiz.submittedAttempts) * 100)
                  : null;
                return (
                  <div
                    key={quiz.quizId}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {quiz.quizTitle}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {quiz.submittedAttempts} submitted of {quiz.participants} participants
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-right text-xs">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            Average
                          </p>
                          <p className="mt-1 font-mono font-bold text-slate-900">
                            {quiz.averagePercentage == null ? "—" : `${quiz.averagePercentage}%`}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            Complete
                          </p>
                          <p className="mt-1 font-mono font-bold text-indigo-600">
                            {quizCompletion == null ? "—" : `${quizCompletion}%`}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            Passed
                          </p>
                          <p className="mt-1 font-mono font-bold text-emerald-600">
                            {quizPassRate == null ? "—" : `${quizPassRate}%`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                        style={{ width: `${Math.min(100, quizCompletion ?? 0)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400">
                      Score range:{" "}
                      {quiz.lowestPercentage == null ? "—" : `${quiz.lowestPercentage}%`} –{" "}
                      {quiz.highestPercentage == null ? "—" : `${quiz.highestPercentage}%`}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-slate-400">
              {analyticsLoading
                ? "Loading live quiz analytics…"
                : analyticsUnavailable
                  ? "Live quiz analytics are unavailable."
                  : "No quiz results are available for today."}
            </p>
          )}
        </section>
      )}

      {/* Main 2-Column Split: Quizzes List & Selected Quiz Question Details */}
      <div className="grid grid-cols-1 gap-6">
        {/* Left Column: Quiz Directory */}
        {!selectedQuiz && (
          <div className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                    Assessment library
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                    Your assessments
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Open an assessment to manage its instructions, questions, and student
                    performance.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1.5 text-[10px] font-bold text-indigo-700">
                    {filtered.length} shown
                  </span>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${viewMode === "list" ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                      aria-label="Show list view"
                      aria-pressed={viewMode === "list"}
                    >
                      <List className="h-3.5 w-3.5" /> List
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                      aria-label="Show grid view"
                      aria-pressed={viewMode === "grid"}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" /> Grid
                    </button>
                  </div>
                  {(search ||
                    gradeFilter !== "All" ||
                    courseFilter !== "All" ||
                    statusFilter !== "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setGradeFilter("All");
                        setCourseFilter("All");
                        setStatusFilter("All");
                      }}
                      className="text-[10px] font-semibold text-slate-400 hover:text-indigo-600"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_190px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search quizzes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Published / Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed</option>
                </select>
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
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Loading quizzes…
              </div>
            )}

            {!teacherQuizState.isLoading && !teacherQuizState.error && filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                {quizzes.length === 0
                  ? "No quizzes have been created for your courses yet."
                  : "No quizzes match the current filters."}
              </div>
            )}

            <div
              className={`${viewMode === "list" ? "block" : "hidden"} overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-slate-900`}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse text-left">
                  <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/70">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      <th className="px-5 py-4">Quiz</th>
                      <th className="px-4 py-4">Course</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4 text-center">Questions</th>
                      <th className="px-4 py-4 text-center">Duration</th>
                      <th className="px-4 py-4 text-center">Attempts</th>
                      <th className="px-4 py-4 text-center">Marks</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((quiz) => (
                      <tr
                        key={`row-${quiz.id}`}
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setQuizPanel(quiz.status === "Completed" ? "results" : "overview");
                          setQuestionPage(0);
                        }}
                        className="group cursor-pointer transition-colors hover:bg-indigo-50/40"
                      >
                        <td className="max-w-[300px] px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                              <ClipboardCheck className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {quiz.title}
                              </p>
                              <p className="mt-1 truncate text-[11px] text-slate-400">
                                {quiz.description || "No description added"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="min-w-[170px]">
                            <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                              {quiz.courseTitle || "Course name unavailable"}
                            </p>
                            <span className="mt-1 inline-flex rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {quiz.courseCode || "No course code"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={quiz.status} />
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold tabular-nums text-slate-700">
                          {quiz.totalQuestions}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold tabular-nums text-slate-700">
                          {quiz.durationMinutes} min
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold tabular-nums text-slate-700">
                          {quiz.attemptsCount}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold tabular-nums text-slate-700">
                          {quiz.totalMarks}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 transition-colors group-hover:text-indigo-700">
                            Open{" "}
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className={`${viewMode === "grid" ? "grid" : "hidden"} grid-cols-1 gap-5 xl:grid-cols-3`}
            >
              {filtered.map((quiz) => {
                return (
                  <div
                    key={quiz.id}
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setQuizPanel(quiz.status === "Completed" ? "results" : "overview");
                      setQuestionPage(0);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedQuiz(quiz);
                        setQuizPanel(quiz.status === "Completed" ? "results" : "overview");
                        setQuestionPage(0);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="group relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-6 text-left shadow-[0_10px_28px_rgba(15,23,42,0.045)] transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_18px_40px_rgba(79,70,229,0.14)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
                  >
                    <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-indigo-50/70 transition-colors group-hover:bg-indigo-100/70" />
                    <div className="relative flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:border-indigo-900/70 dark:bg-indigo-950/50 dark:text-indigo-300">
                          {quiz.courseCode || "No course code"}
                        </span>
                        <p className="mt-2 truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {quiz.courseTitle || "Course name unavailable"}
                        </p>
                      </div>
                      <StatusBadge status={quiz.status} />
                    </div>
                    <div className="relative mt-4 flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold leading-5 text-slate-900 line-clamp-2">
                        {quiz.title}
                      </h3>
                      <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
                    </div>
                    <p className="relative mt-2 min-h-10 text-xs leading-5 text-slate-500 line-clamp-2">
                      {quiz.description ||
                        "No instructions added yet. Open this assessment to complete its setup."}
                    </p>
                    <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Questions
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {quiz.totalQuestions}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Duration
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {quiz.durationMinutes} min
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Attempts
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {quiz.attemptsCount}
                        </p>
                      </div>
                    </div>
                    <div className="relative mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>{quiz.totalMarks} total marks</span>
                      <span className="text-indigo-600 transition-colors group-hover:text-indigo-700">
                        Open workspace →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Column: Quiz Question Breakdown & Questions Builder */}
        {selectedQuiz && (
          <div className="w-full overflow-hidden border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="flex shrink-0 flex-col justify-between gap-6 border-b border-indigo-900/50 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white sm:p-8 lg:flex-row lg:items-end">
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedQuiz(null)}
                  className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to quiz library
                </button>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-300">
                      {selectedQuiz.courseTitle || "Course name unavailable"}
                    </p>
                    <span className="mt-1 inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-xs font-mono font-bold text-indigo-300">
                      {selectedQuiz.courseCode || "No course code"}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white">
                    {selectedQuiz.title || "Untitled quiz"}
                  </h2>
                  <StatusBadge status={selectedQuiz.status} />
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Duration:{" "}
                  <strong className="text-slate-200">{selectedQuiz.durationMinutes} mins</strong> ·
                  Total Marks: <strong className="text-slate-200">{selectedQuiz.totalMarks}</strong>{" "}
                  · {selectedQuiz.attemptsCount} student attempts
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {selectedQuiz.questions.length > 0 && (
                  <button
                    onClick={() => setSliderPreviewQuiz(selectedQuiz)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/15"
                    title="Preview quiz questions in Card Slider view"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Card Slider</span>
                  </button>
                )}
                {selectedQuiz.status === "Draft" && (
                  <button
                    onClick={() => setEditingQuiz(selectedQuiz)}
                    className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/15"
                  >
                    Edit
                  </button>
                )}
                {selectedQuiz.status === "Draft" && (
                  <button
                    onClick={() => void handlePublishQuiz()}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publish
                  </button>
                )}
                <button
                  onClick={() => setIsQuestionBuilderOpen(true)}
                  disabled={selectedQuiz.status !== "Draft"}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Question
                </button>
                {selectedQuiz.status === "Draft" && (
                  <button
                    onClick={() => setIsDeleteQuizOpen(true)}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-rose-300"
                    title="Delete quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-7">
              <button
                type="button"
                onClick={() => setQuizPanel("overview")}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${quizPanel === "overview" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Overview
                </span>
              </button>
              <button
                type="button"
                onClick={() => setQuizPanel("questions")}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${quizPanel === "questions" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> Questions
                </span>
              </button>
              <button
                type="button"
                onClick={() => setQuizPanel("results")}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${quizPanel === "results" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Student results
                </span>
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40">
              {quizPanel === "results" && (
                <QuizResultsPanel
                  quiz={selectedQuiz}
                  results={quizResults}
                  isLoading={isResultsLoading}
                  error={resultsError}
                  selectedStudentId={selectedStudentResultId}
                  onSelectStudent={setSelectedStudentResultId}
                  studentNumbers={studentNumbers}
                />
              )}
              {quizPanel === "overview" && <QuizOverviewPanel quiz={selectedQuiz} />}
              {quizPanel === "questions" && (
                <div className="space-y-4 p-6 sm:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                        Question set
                      </p>
                      <h3 className="mt-1 flex items-center gap-1.5 text-lg font-bold text-slate-900 dark:text-white">
                        <Layers className="h-4 w-4 text-indigo-600" />
                        {selectedQuiz.questions.length} questions
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        Review each question and its correct answer before publishing.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        Total marks
                      </p>
                      <p className="mt-1 text-lg font-bold text-indigo-600">
                        {selectedQuiz.totalMarks}
                      </p>
                    </div>
                  </div>

                  {selectedQuiz.questions.length === 0 ? (
                    <div className="border-y border-dashed border-slate-300 py-14 text-center dark:border-slate-700">
                      <HelpCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        No questions configured yet
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Click &quot;Add Question&quot; above or use the question builder to generate
                        questions.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleQuestions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="space-y-3 border-b border-slate-200 py-5 first:pt-1 last:border-b-0 dark:border-slate-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                {questionPage * questionsPerPage + idx + 1}
                              </span>
                              <div>
                                <p className="text-xs font-semibold leading-snug text-slate-900 dark:text-slate-100 sm:text-sm">
                                  {q.question}
                                </p>
                                <span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">
                                  Multiple choice · one correct answer
                                </span>
                              </div>
                            </div>

                            <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                              {q.marks} marks
                            </span>
                            <div className="flex gap-2 shrink-0">
                              {selectedQuiz.status === "Draft" && (
                                <button
                                  onClick={() => setEditingQuestion(q)}
                                  className="text-[10px] text-slate-600 hover:text-indigo-600"
                                >
                                  Edit
                                </button>
                              )}
                              {selectedQuiz.status === "Draft" && (
                                <button
                                  onClick={() => setDeletingQuestionId(q.id)}
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
                                        ? "border-emerald-200 bg-emerald-50/80 font-medium text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200"
                                        : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
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
                            <div className="border-l-2 border-indigo-200 pl-3 text-[11px] leading-relaxed text-slate-500 dark:border-indigo-800 dark:text-slate-400">
                              <strong className="text-slate-700 dark:text-slate-300">
                                Explanation:{" "}
                              </strong>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedQuiz.questions.length > questionsPerPage && (
                    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[11px] text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {questionPage * questionsPerPage + 1}–
                          {Math.min(
                            (questionPage + 1) * questionsPerPage,
                            selectedQuiz.questions.length,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {selectedQuiz.questions.length}
                        </span>{" "}
                        questions
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuestionPage((page) => Math.max(0, page - 1))}
                          disabled={questionPage === 0}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" /> Previous
                        </button>
                        <span className="min-w-16 text-center text-[11px] font-semibold text-slate-500">
                          {questionPage + 1} / {totalQuestionPages}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuestionPage((page) => Math.min(totalQuestionPages - 1, page + 1))
                          }
                          disabled={questionPage >= totalQuestionPages - 1}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
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

      {sliderPreviewQuiz && (
        <AiQuizCardSliderModal
          draft={quizToSliderDraft(sliderPreviewQuiz)}
          initialTitle={sliderPreviewQuiz.title}
          initialDescription={sliderPreviewQuiz.description}
          initialDuration={sliderPreviewQuiz.durationMinutes}
          initialPassMark={
            sliderPreviewQuiz.passMark ?? Math.round(sliderPreviewQuiz.totalMarks * 0.8 * 100) / 100
          }
          initialStartTime={sliderPreviewQuiz.startTime || ""}
          initialEndTime={sliderPreviewQuiz.endTime || ""}
          initialMaxAttempts={sliderPreviewQuiz.maxAttempts ?? 1}
          initialShowResultImmediately={sliderPreviewQuiz.showResultImmediately ?? true}
          course={teacherCourses.find((course) => course.id === sliderPreviewQuiz.courseId)}
          onClose={() => setSliderPreviewQuiz(null)}
          onRegenerate={() => setSliderPreviewQuiz(null)}
          onQuizCreated={(createdQuiz) => {
            const mapped = mapBackendQuiz(createdQuiz, teacherCourses);
            setQuizzes((current) => [mapped, ...current.filter((quiz) => quiz.id !== mapped.id)]);
            setSelectedQuiz(mapped);
            setSliderPreviewQuiz(null);
          }}
        />
      )}

      <CreateQuizModal
        isOpen={isCreateQuizOpen}
        courses={teacherCourses}
        onClose={() => setIsCreateQuizOpen(false)}
        onQuizCreated={(createdQuiz) => {
          const mapped = mapBackendQuiz(createdQuiz, teacherCourses);
          setQuizzes((current) => [mapped, ...current.filter((quiz) => quiz.id !== mapped.id)]);
          setSelectedQuiz(mapped);
        }}
      />
      <TextInputModal
        isOpen={Boolean(editingQuiz)}
        title="Edit quiz"
        label="Quiz title"
        initialValue={editingQuiz?.title ?? ""}
        onClose={() => setEditingQuiz(null)}
        onSave={handleEditQuiz}
      />
      <TextInputModal
        isOpen={Boolean(editingQuestion)}
        title="Edit question"
        label="Question text"
        initialValue={editingQuestion?.question ?? ""}
        multiline
        onClose={() => setEditingQuestion(null)}
        onSave={handleEditQuestion}
      />
      <ConfirmModal
        isOpen={isDeleteQuizOpen}
        title="Delete quiz?"
        description={`Deleting “${selectedQuiz?.title ?? "this quiz"}” removes the quiz and its questions.`}
        onClose={() => setIsDeleteQuizOpen(false)}
        onConfirm={handleDeleteQuiz}
      />
      <ConfirmModal
        isOpen={Boolean(deletingQuestionId)}
        title="Delete question?"
        description="This permanently removes the question from the draft quiz."
        onClose={() => setDeletingQuestionId(null)}
        onConfirm={handleDeleteQuestion}
      />
    </div>
  );
};

interface QuizResultsPanelProps {
  quiz: Quiz;
  results: TeacherQuizResults | null;
  isLoading: boolean;
  error: string | null;
  selectedStudentId: string | null;
  onSelectStudent: (studentId: string | null) => void;
  studentNumbers: Record<string, string>;
}

function QuizOverviewPanel({ quiz }: { quiz: Quiz }) {
  const details = [
    { label: "Questions", value: quiz.totalQuestions, tone: "text-indigo-700 bg-indigo-50" },
    { label: "Total marks", value: quiz.totalMarks, tone: "text-violet-700 bg-violet-50" },
    { label: "Duration", value: `${quiz.durationMinutes} min`, tone: "text-amber-700 bg-amber-50" },
    { label: "Attempts", value: quiz.attemptsCount, tone: "text-emerald-700 bg-emerald-50" },
  ];

  return (
    <div className="space-y-6 p-5 sm:p-8">
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              About this quiz
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{quiz.title}</h3>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              {quiz.description || "No instructions have been added for this quiz yet."}
            </p>
          </div>
          <StatusBadge status={quiz.status} />
        </div>
        <div className="mt-6 grid grid-cols-2 border-t border-slate-200 pt-4 dark:border-slate-800 sm:grid-cols-4">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="border-r border-slate-200 px-3 py-1 first:pl-0 last:border-r-0 dark:border-slate-800"
            >
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{detail.label}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 border-b border-slate-200 pb-6 dark:border-slate-800 sm:grid-cols-2">
        <div className="border-b border-slate-200 pb-5 sm:border-b-0 sm:border-r sm:pr-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="h-4 w-4" />
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delivery settings</h4>
          </div>
          <dl className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Pass mark</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-200">
                {quiz.totalMarks ? Math.round(quiz.totalMarks * 0.6) : "—"} marks
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Availability</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-200">
                {quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : "Open schedule"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Attempts submitted</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-200">
                {quiz.attemptsCount}
              </dd>
            </div>
          </dl>
        </div>
        <div className="pb-2 sm:pl-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ClipboardCheck className="h-4 w-4" />
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Teacher checklist</h4>
          </div>
          <ul className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Review the instructions
              before publishing
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Confirm each question has
              one correct answer
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Open Student results after
              submissions arrive
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function QuizQuestionsPanel({
  quiz,
  questions,
  page,
  totalPages,
  questionsPerPage,
  onPageChange,
  onEdit,
  onDelete,
}: {
  quiz: Quiz;
  questions: QuizQuestion[];
  page: number;
  totalPages: number;
  questionsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (question: QuizQuestion) => void;
  onDelete: (questionId: string) => void;
}) {
  return (
    <div className="space-y-4 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
            Question bank
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-900">
            {quiz.questions.length} questions
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
          {quiz.totalMarks} total marks
        </span>
      </div>
      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-xs text-slate-500">
          No questions configured yet.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700">
                  {page * questionsPerPage + index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-5 text-slate-900">
                      {question.question}
                    </p>
                    <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">
                      {question.marks} marks
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {(question.options ?? []).map((option) => {
                      const correct = option === question.correctAnswer;
                      return (
                        <div
                          key={option}
                          className={`rounded-xl border px-3 py-2 text-xs ${correct ? "border-emerald-200 bg-emerald-50 font-semibold text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}
                        >
                          <span className="mr-2">{correct ? "✓" : "○"}</span>
                          {option}
                        </div>
                      );
                    })}
                  </div>
                  {question.explanation && (
                    <p className="mt-3 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500">
                      <strong className="text-slate-700">Explanation: </strong>
                      {question.explanation}
                    </p>
                  )}
                  {quiz.status === "Draft" && (
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(question)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Edit question
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(question.id)}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800"
                      >
                        Delete question
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {quiz.questions.length > questionsPerPage && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-[11px] text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange(Math.max(0, page - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizResultsPanel({
  quiz,
  results,
  isLoading,
  error,
  selectedStudentId,
  onSelectStudent,
  studentNumbers,
}: QuizResultsPanelProps) {
  const resultRows = results?.results ?? [];
  const availableResultRows = resultRows.filter((result) =>
    Boolean(studentNumbers[result.studentId]),
  );
  const passedCount = availableResultRows.filter((result) => result.passed).length;
  const average = availableResultRows.length
    ? Math.round(
        availableResultRows.reduce((total, result) => total + Number(result.percentage ?? 0), 0) /
          availableResultRows.length,
      )
    : 0;
  const selectedResult = availableResultRows.find(
    (result) => result.studentId === selectedStudentId,
  );

  if (isLoading) {
    return <div className="p-10 text-center text-xs text-slate-500">Loading student results…</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm font-bold text-slate-800">Results are unavailable</p>
        <p className="mt-1 text-xs text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <Users className="h-4 w-4 text-indigo-600" />
          <p className="mt-3 text-xl font-bold text-slate-900">{availableResultRows.length}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Submitted
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <Award className="h-4 w-4 text-emerald-600" />
          <p className="mt-3 text-xl font-bold text-emerald-700">{passedCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600/70">
            Passed
          </p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-3">
          <BarChart3 className="h-4 w-4 text-violet-600" />
          <p className="mt-3 text-xl font-bold text-violet-700">
            {availableResultRows.length ? `${average}%` : "—"}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600/70">
            Average
          </p>
        </div>
      </div>

      {availableResultRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <ClipboardCheck className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-700">No submitted answers yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Student results will appear here after the quiz is submitted.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-[minmax(0,1fr)_72px_72px_84px] gap-3 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:px-4">
            <span>Student</span>
            <span>Score</span>
            <span>Result</span>
            <span>Submitted</span>
          </div>
          <div className="divide-y divide-slate-100">
            {availableResultRows.map((result) => {
              const percentage = Number(result.percentage ?? 0);
              const selected = result.studentId === selectedStudentId;
              return (
                <button
                  type="button"
                  key={result.studentId}
                  onClick={() => onSelectStudent(selected ? null : result.studentId)}
                  className={`grid w-full grid-cols-[minmax(0,1fr)_72px_72px_84px] items-center gap-3 px-3 py-3 text-left transition-colors sm:px-4 ${selected ? "bg-indigo-50" : "bg-white hover:bg-slate-50"}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-slate-800">
                      {result.studentName || "Student"}
                    </span>
                    <span className="block truncate text-[10px] text-slate-400">
                      {studentNumbers[result.studentId] || "Student ID unavailable"}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {result.marksObtained ?? 0}/{results?.totalMarks ?? quiz.totalMarks}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${result.passed ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedResult && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {selectedResult.studentName || "Student"} · Answer review
              </p>
              <p className="text-xs text-slate-500">
                Question-by-question response and correct answer comparison
              </p>
            </div>
            <span
              className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${selectedResult.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
            >
              {selectedResult.passed ? "Passed" : "Needs support"}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {(selectedResult.answers ?? []).map((answer, index) => (
              <div key={answer.questionId} className="rounded-lg border border-white bg-white p-3">
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${answer.correct ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">{answer.questionText}</p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Student answer:{" "}
                      <span
                        className={
                          answer.correct
                            ? "font-semibold text-emerald-700"
                            : "font-semibold text-rose-700"
                        }
                      >
                        {answer.selectedAnswer}
                      </span>
                    </p>
                    {!answer.correct && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        Correct answer:{" "}
                        <span className="font-semibold text-emerald-700">
                          {answer.correctAnswer}
                        </span>
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                    {answer.awardedMarks ?? 0} marks
                  </span>
                </div>
              </div>
            ))}
            {(selectedResult.answers ?? []).length === 0 && (
              <p className="text-xs text-slate-500">
                Detailed answer data is not available for this submission.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function quizToSliderDraft(quiz: Quiz): AiQuizDraft {
  return {
    courseId: quiz.courseId,
    questionCount: quiz.questions.length,
    difficulty: "MEDIUM",
    questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER",
    creationMethod: "AI_GENERATED",
    provider: "Automated question builder",
    model: "Question builder",
    questions: quiz.questions.map((question, index) => ({
      questionText: question.question,
      questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER",
      marks: question.marks,
      questionOrder: index + 1,
      options: (question.options ?? []).map((option, optionIndex) => ({
        optionText: option,
        correct: option === question.correctAnswer,
        optionOrder: optionIndex + 1,
      })),
      explanation: question.explanation,
    })),
  };
}

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
    courseTitle: course?.title || "Course name unavailable",
    title: quiz.title || "Untitled quiz",
    description: quiz.description || "No quiz description available.",
    durationMinutes: quiz.durationMinutes,
    passMark: Number(quiz.passMark),
    startTime: quiz.startTime,
    endTime: quiz.endTime,
    maxAttempts: quiz.maxAttempts,
    showResultImmediately: quiz.showResultImmediately,
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
    explanation: question.explanation ?? "",
    marks: Number(question.marks),
  };
}

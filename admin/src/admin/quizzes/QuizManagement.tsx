import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  Clock,
  Filter,
  HelpCircle,
  Loader2,
  RefreshCcw,
  Search,
  Send,
  Users,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { DetailDrawer } from "../components/DetailDrawer";
import { Course, Grade, Quiz } from "../types";
import {
  fetchCourseQuizzes,
  fetchQuizResults,
  type AdminQuizRecord,
  type QuizResultRecord,
} from "../api/quizzesApi";
import { fetchTodayAdminQuizAnalytics, type AdminQuizAnalyticsItem } from "../api/quizAnalyticsApi";
import { EmptyState } from "../../../../shared/ui/EmptyState";

/* These effects synchronize dependent filters and remote quiz data. */
/* eslint-disable react-hooks/set-state-in-effect */

interface QuizManagementProps {
  courses: Course[];
  grades: Grade[];
}

const ALL = "all";

const toQuiz = (item: AdminQuizRecord, course?: Course): Quiz => ({
  id: item.id,
  courseId: item.courseId,
  courseCode: course?.code || item.courseId,
  courseTitle: course?.title || "Unknown course",
  teacherName: course?.teacherName || "Unassigned faculty",
  title: item.title,
  questionCount: item.questionCount ?? item.questions?.length ?? 0,
  durationMinutes: item.durationMinutes ?? 0,
  attemptsCount: 0,
  averageScore: 0,
  passingRate: 0,
  status: item.status === "PUBLISHED" ? "ACTIVE" : item.status === "CLOSED" ? "ARCHIVED" : "DRAFT",
});

export const QuizManagement: React.FC<QuizManagementProps> = ({ courses, grades }) => {
  const [gradeId, setGradeId] = useState(ALL);
  const [domain, setDomain] = useState(ALL);
  const [courseId, setCourseId] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [search, setSearch] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResultRecord[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const [resultsSearch, setResultsSearch] = useState("");
  const [resultsFilter, setResultsFilter] = useState(ALL);
  const [todayAnalytics, setTodayAnalytics] = useState<AdminQuizAnalyticsItem[]>([]);
  const [analyticsDate, setAnalyticsDate] = useState("");
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const gradeOptions = useMemo(() => {
    const values = new Map<string, string>();
    grades.forEach((grade) => values.set(grade.id, grade.name));
    courses.forEach((course) => {
      if (course.gradeId && course.gradeName) values.set(course.gradeId, course.gradeName);
    });
    return Array.from(values, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
  }, [courses, grades]);
  const gradeCourses = useMemo(
    () => (gradeId === ALL ? courses : courses.filter((course) => course.gradeId === gradeId)),
    [courses, gradeId],
  );
  const domainOptions = useMemo(() => {
    const selectedGrade = grades.find((grade) => grade.id === gradeId);
    const values = new Set<string>(selectedGrade?.subjectDomains || []);
    gradeCourses.forEach((course) => values.add(course.subject || course.category));
    return Array.from(values)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [gradeCourses, gradeId, grades]);
  const filteredCourses = useMemo(
    () =>
      gradeCourses.filter(
        (course) => domain === ALL || (course.subject || course.category) === domain,
      ),
    [domain, gradeCourses],
  );
  const filteredQuizzes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return quizzes.filter((quiz) => {
      const matchesSearch =
        !query ||
        [quiz.title, quiz.courseCode, quiz.courseTitle, quiz.teacherName].some((value) =>
          value.toLowerCase().includes(query),
        );
      return (
        matchesSearch &&
        (courseId === ALL || quiz.courseId === courseId) &&
        (status === ALL || quiz.status === status)
      );
    });
  }, [courseId, quizzes, search, status]);

  const aggregateAnalytics = useMemo(() => {
    const totals = todayAnalytics.reduce(
      (result, quiz) => ({
        submitted: result.submitted + quiz.submittedAttempts,
        participants: result.participants + quiz.participants,
        passed: result.passed + quiz.passedAttempts,
        scoreTotal: result.scoreTotal + (quiz.averagePercentage ?? 0),
        scored: result.scored + (quiz.averagePercentage == null ? 0 : 1),
      }),
      { submitted: 0, participants: 0, passed: 0, scoreTotal: 0, scored: 0 },
    );
    return {
      attempts: totals.submitted,
      participants: totals.participants,
      averageScore: totals.scored ? totals.scoreTotal / totals.scored : null,
      passingRate: totals.submitted ? (totals.passed / totals.submitted) * 100 : null,
    };
  }, [todayAnalytics]);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const response = await fetchTodayAdminQuizAnalytics();
      setTodayAnalytics(response?.quizzes ?? []);
      setAnalyticsDate(response?.date ?? "");
    } catch {
      setAnalyticsError("Live quiz analytics are temporarily unavailable.");
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);
  useEffect(() => {
    if (domain !== ALL && !domainOptions.includes(domain)) setDomain(ALL);
  }, [domain, domainOptions]);
  useEffect(() => {
    if (courseId !== ALL && filteredCourses.some((course) => course.id === courseId)) return;
    setCourseId(ALL);
  }, [courseId, filteredCourses]);
  useEffect(() => {
    const selectedCourses =
      courseId === ALL
        ? filteredCourses
        : filteredCourses.filter((course) => course.id === courseId);
    if (!selectedCourses.length) {
      setQuizzes([]);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError("");
    Promise.allSettled(
      selectedCourses.map((course) => fetchCourseQuizzes(course.id, controller.signal)),
    )
      .then((results) => {
        if (controller.signal.aborted) return;
        const successful = results.filter(
          (result): result is PromiseFulfilledResult<AdminQuizRecord[]> =>
            result.status === "fulfilled",
        );
        const failed = results.flatMap((result, index) =>
          result.status === "rejected"
            ? [
                `${selectedCourses[index]?.title || "A selected course"}: ${
                  result.reason instanceof Error
                    ? result.reason.message
                    : "The quiz service rejected the request."
                }`,
              ]
            : [],
        );
        setQuizzes(
          successful
            .flatMap((result) => result.value)
            .map((item) =>
              toQuiz(
                item,
                courses.find((course) => course.id === item.courseId),
              ),
            ),
        );
        if (failed.length) {
          setError(
            successful.length
              ? `Some quizzes could not be loaded: ${failed.join("; ")}`
              : `Quizzes could not be loaded for the selected courses: ${failed.join("; ")}`,
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [courseId, courses, filteredCourses]);

  const selectedAnalytics = selectedQuiz
    ? todayAnalytics.find((item) => item.quizId === selectedQuiz.id)
    : undefined;
  const filteredResults = useMemo(() => {
    const query = resultsSearch.trim().toLowerCase();
    return quizResults.filter((result) => {
      const matchesStudent =
        !query ||
        result.studentName.toLowerCase().includes(query) ||
        result.studentId.toLowerCase().includes(query);
      const matchesStatus =
        resultsFilter === ALL || (resultsFilter === "PASSED" ? result.passed : !result.passed);
      return matchesStudent && matchesStatus;
    });
  }, [quizResults, resultsFilter, resultsSearch]);

  useEffect(() => {
    if (!selectedQuiz) {
      setQuizResults([]);
      setResultsError("");
      return;
    }
    const controller = new AbortController();
    setResultsLoading(true);
    setResultsError("");
    setResultsSearch("");
    setResultsFilter(ALL);
    void fetchQuizResults(selectedQuiz.id, controller.signal)
      .then((response) => setQuizResults(response.results ?? []))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setQuizResults([]);
          setResultsError(
            reason instanceof Error ? reason.message : "Quiz results could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setResultsLoading(false);
      });
    return () => controller.abort();
  }, [selectedQuiz]);
  const resetFilters = () => {
    setGradeId(ALL);
    setDomain(ALL);
    setCourseId(ALL);
    setStatus(ALL);
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quiz Management & Analytics"
        description="Monitor live formative quizzes, question coverage, student attempts, score performance, and pass rates across the academic catalogue."
        breadcrumbs={[{ label: "Admin" }, { label: "Academic Management" }, { label: "Quizzes" }]}
      />
      {analyticsError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          <span>{analyticsError}</span>
          <button
            onClick={() => void loadAnalytics()}
            disabled={analyticsLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-semibold dark:border-amber-800 dark:bg-slate-900"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${analyticsLoading ? "animate-spin" : ""}`} />
            Retry
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Quiz filters</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Narrow quizzes by grade, domain, course, and lifecycle status.
              </p>
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
          >
            Reset filters
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Grade
            <select
              value={gradeId}
              onChange={(event) => {
                setGradeId(event.target.value);
                setDomain(ALL);
                setCourseId(ALL);
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value={ALL}>All grades</option>
              {gradeOptions.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Course domain
            <select
              value={domain}
              onChange={(event) => {
                setDomain(event.target.value);
                setCourseId(ALL);
              }}
              disabled={!domainOptions.length}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value={ALL}>All domains</option>
              {domainOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Course
            <select
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              disabled={!filteredCourses.length}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value={ALL}>All courses</option>
              {filteredCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value={ALL}>All statuses</option>
              <option value="ACTIVE">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Closed</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Search quizzes
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Title, course, teacher"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </label>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500">Quizzes</span>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {filteredQuizzes.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500">Live attempts today</span>
          <p className="mt-1 text-2xl font-bold text-indigo-600">
            {analyticsLoading ? "—" : aggregateAnalytics.attempts}
          </p>
          <span className="text-[11px] text-slate-400">
            {aggregateAnalytics.participants} participants
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500">Average score</span>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {analyticsLoading || aggregateAnalytics.averageScore === null
              ? "—"
              : `${aggregateAnalytics.averageScore.toFixed(1)}%`}
          </p>
          <span className="text-[11px] text-slate-400">
            {analyticsDate ? `Results for ${analyticsDate}` : "Live analytics"}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500">Average pass rate</span>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {analyticsLoading || aggregateAnalytics.passingRate === null
              ? "—"
              : `${aggregateAnalytics.passingRate.toFixed(1)}%`}
          </p>
          <span className="text-[11px] text-slate-400">From submitted attempts</span>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-sm text-slate-500 dark:border-slate-700">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-500" />
          Loading live quizzes…
        </div>
      )}
      {!isLoading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}
      {!isLoading && !error && !filteredQuizzes.length && (
        <EmptyState
          icon={BookOpenCheck}
          title="No quizzes found"
          description="Try another grade, domain, course, or status."
        />
      )}

      {!isLoading && filteredQuizzes.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Quiz catalogue
              </h2>
              <p className="text-xs text-slate-500">
                {filteredQuizzes.length} quizzes in the current view
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Send className="h-3.5 w-3.5" />
              Live data
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-4 py-3 font-semibold">Quiz</th>
                  <th className="px-4 py-3 font-semibold">Course & faculty</th>
                  <th className="px-4 py-3 font-semibold">Questions & time</th>
                  <th className="px-4 py-3 font-semibold">Attempts</th>
                  <th className="px-4 py-3 font-semibold">Average score</th>
                  <th className="px-4 py-3 font-semibold">Pass rate</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredQuizzes.map((quiz) => {
                  const analytics = todayAnalytics.find((item) => item.quizId === quiz.id);
                  return (
                    <tr
                      key={quiz.id}
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                            <HelpCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-900 dark:text-white">
                              {quiz.title}
                            </span>
                            <span className="mt-1 block text-[11px] text-slate-400">
                              {quiz.status === "ACTIVE"
                                ? "Published assessment"
                                : quiz.status === "DRAFT"
                                  ? "Draft assessment"
                                  : "Closed assessment"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {quiz.courseCode}
                        </span>
                        <span className="mt-1 block text-slate-500">{quiz.courseTitle}</span>
                        <span className="mt-1 block text-[11px] text-slate-400">
                          {quiz.teacherName}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                          {quiz.questionCount} questions
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-400">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {quiz.durationMinutes} minutes
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold tabular-nums text-slate-900 dark:text-white">
                        {analytics?.submittedAttempts ?? "—"}
                      </td>
                      <td className="px-4 py-4 font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                        {analytics?.averagePercentage == null
                          ? "—"
                          : `${analytics.averagePercentage}%`}
                      </td>
                      <td className="px-4 py-4 font-bold tabular-nums text-emerald-600">
                        {analytics
                          ? `${analytics.submittedAttempts ? ((analytics.passedAttempts / analytics.submittedAttempts) * 100).toFixed(1) : "0.0"}%`
                          : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            quiz.status === "ACTIVE"
                              ? "PUBLISHED"
                              : quiz.status === "ARCHIVED"
                                ? "CLOSED"
                                : "DRAFT"
                          }
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setSelectedQuiz(quiz)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                        >
                          Analytics
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-slate-400">Average score</span>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {selectedAnalytics?.averagePercentage ?? "—"}%
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-slate-400">Pass rate</span>
                <p className="mt-1 text-xl font-bold text-emerald-600">
                  {selectedAnalytics
                    ? `${selectedAnalytics.submittedAttempts ? ((selectedAnalytics.passedAttempts / selectedAnalytics.submittedAttempts) * 100).toFixed(1) : "0.0"}%`
                    : "—"}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <h5 className="font-semibold text-slate-900 dark:text-white">Score distribution</h5>
              {selectedAnalytics ? (
                <div className="mt-3 space-y-3">
                  <p className="text-slate-600 dark:text-slate-300">
                    {selectedAnalytics.submittedAttempts} submitted attempts from{" "}
                    {selectedAnalytics.participants} participants.
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{
                        width: `${selectedAnalytics.submittedAttempts ? (selectedAnalytics.passedAttempts / selectedAnalytics.submittedAttempts) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-500">
                    <span>Average: {selectedAnalytics.averagePercentage ?? "—"}%</span>
                    <span>Highest: {selectedAnalytics.highestPercentage ?? "—"}%</span>
                    <span>Lowest: {selectedAnalytics.lowestPercentage ?? "—"}%</span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-slate-500">
                  Live analytics are not available for this quiz today.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
                <div>
                  <h5 className="font-semibold text-slate-900 dark:text-white">Student results</h5>
                  <p className="mt-1 text-slate-500">
                    Latest submitted result for each student.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Users className="h-4 w-4" />
                  {quizResults.length} students
                </div>
              </div>
              <div className="grid gap-2 border-b border-slate-200 p-4 sm:grid-cols-[1fr_auto] dark:border-slate-800">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    value={resultsSearch}
                    onChange={(event) => setResultsSearch(event.target.value)}
                    placeholder="Search student name or ID"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <select
                  value={resultsFilter}
                  onChange={(event) => setResultsFilter(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value={ALL}>All results</option>
                  <option value="PASSED">Passed</option>
                  <option value="FAILED">Needs improvement</option>
                </select>
              </div>
              {resultsLoading && (
                <div className="flex items-center justify-center p-8 text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-indigo-500" />
                  Loading student results…
                </div>
              )}
              {!resultsLoading && resultsError && (
                <p className="p-4 text-rose-600 dark:text-rose-300">{resultsError}</p>
              )}
              {!resultsLoading && !resultsError && !filteredResults.length && (
                <div className="p-8 text-center text-slate-500">
                  <Users className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                  No submitted student results match the current filter.
                </div>
              )}
              {!resultsLoading && !resultsError && filteredResults.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Student</th>
                        <th className="px-4 py-3 font-semibold">Score</th>
                        <th className="px-4 py-3 font-semibold">Submitted</th>
                        <th className="px-4 py-3 font-semibold">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredResults.map((result) => (
                        <tr key={result.studentId}>
                          <td className="px-4 py-3">
                            <span className="block font-semibold text-slate-900 dark:text-white">
                              {result.studentName}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                            {result.marksObtained ?? "—"} marks
                            <span className="ml-1 text-slate-400">
                              ({result.percentage ?? "—"}%)
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                            {result.submittedAt
                              ? new Date(result.submittedAt).toLocaleString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                result.passed
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              }`}
                            >
                              {result.passed ? "Passed" : "Needs improvement"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </DetailDrawer>
      )}
    </div>
  );
};

/* eslint-enable react-hooks/set-state-in-effect */

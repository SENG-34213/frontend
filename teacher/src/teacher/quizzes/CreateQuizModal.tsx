import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Course } from "../types";
import {
  createQuiz,
  createQuizQuestion,
  getQuiz,
  publishQuiz,
  type BackendQuiz,
} from "../api/quizApi";

type DraftQuestion = {
  questionText: string;
  marks: number;
  options: string[];
  correctOption: number;
  explanation: string;
};

interface CreateQuizModalProps {
  isOpen: boolean;
  courses: Course[];
  initialCourseId?: string;
  onClose: () => void;
  onQuizCreated: (quiz: BackendQuiz) => void;
}

const blankQuestion = (): DraftQuestion => ({
  questionText: "",
  marks: 5,
  options: ["Choice A", "Choice B", "Choice C", "Choice D"],
  correctOption: 0,
  explanation: "",
});

const currentDateTimeInputValue = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  courses,
  initialCourseId,
  onClose,
  onQuizCreated,
}) => {
  const [step, setStep] = useState<"config" | "questions">("config");
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passMark, setPassMark] = useState(15);
  const [passMarkManuallyEdited, setPassMarkManuallyEdited] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [showResultImmediately, setShowResultImmediately] = useState(true);
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion()]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draftQuizId, setDraftQuizId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCourseId(initialCourseId ?? courses[0]?.id ?? "");
    setStep("config");
    setTitle("");
    setDescription("");
    setDurationMinutes(30);
    setPassMark(0);
    setPassMarkManuallyEdited(false);
    setStartTime("");
    setEndTime("");
    setMaxAttempts(1);
    setShowResultImmediately(true);
    setQuestions([blankQuestion()]);
    setActiveQuestionIndex(0);
    setError("");
    setDraftQuizId(null);
  }, [isOpen, courses, initialCourseId]);

  const totalMarks = useMemo(
    () => questions.reduce((sum, question) => sum + Number(question.marks || 0), 0),
    [questions],
  );

  useEffect(() => {
    if (!passMarkManuallyEdited) {
      setPassMark(Math.round(totalMarks * 0.8 * 100) / 100);
    }
  }, [totalMarks, passMarkManuallyEdited]);

  const durationFromSchedule = (start: string, end: string) => {
    if (!start || !end) return;
    const minutes = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    if (Number.isFinite(minutes) && minutes > 0) setDurationMinutes(minutes);
  };

  const updateStartTime = (value: string) => {
    setStartTime(value);
    durationFromSchedule(value, endTime);
  };

  const updateEndTime = (value: string) => {
    setEndTime(value);
    durationFromSchedule(startTime, value);
  };

  const updateQuestion = (index: number, update: Partial<DraftQuestion>) => {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...update } : question,
      ),
    );
  };

  const addQuestion = () => {
    setQuestions((current) => [...current, blankQuestion()]);
    setActiveQuestionIndex(questions.length);
  };

  const removeQuestion = (index: number) => {
    setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setActiveQuestionIndex((current) => Math.max(0, Math.min(current, questions.length - 2)));
  };

  const validateSettings = () => {
    if (!courseId) return "Select a course.";
    if (!title.trim()) return "Quiz title is required.";
    if (title.trim().length > 150) return "Quiz title cannot exceed 150 characters.";
    if (!Number.isInteger(durationMinutes) || durationMinutes < 1)
      return "Duration must be a positive whole number of minutes.";
    if (startTime && new Date(startTime).getTime() < Date.now())
      return "Quiz start time cannot be before the current date and time.";
    if (!Number.isInteger(passMark) || passMark < 0)
      return "Pass mark must be a whole number of 0 or greater.";
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1)
      return "Maximum attempts must be a positive whole number.";
    return "";
  };

  const validateQuestions = () => {
    if (questions.some((question) => !question.questionText.trim()))
      return "Every question needs a prompt.";
    if (questions.some((question) => question.options.some((option) => !option.trim())))
      return "Every answer choice must have text.";
    if (questions.some((question) => !Number.isInteger(question.marks) || question.marks < 1))
      return "Every question must have a positive whole-number mark.";
    return "";
  };

  const validate = (forPublish: boolean) => {
    const settingsError = validateSettings();
    if (settingsError) return settingsError;
    const questionError = validateQuestions();
    if (questionError) return questionError;
    if (forPublish && passMark > totalMarks)
      return `Pass mark (${passMark}) cannot be greater than total marks (${totalMarks}).`;
    return "";
  };

  const submit = async (publishImmediately: boolean) => {
    const validationError = validate(publishImmediately);
    if (validationError) {
      setError(validationError);
      setStep(
        validationError.includes("question") || validationError.includes("choice")
          ? "questions"
          : step,
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      let quiz: BackendQuiz;
      if (draftQuizId) {
        try {
          quiz = await getQuiz(draftQuizId);
        } catch (requestError) {
          throw new Error(
            `The existing draft could not be recovered. ${
              requestError instanceof Error ? requestError.message : "Please try again."
            }`,
          );
        }
      } else {
        quiz = await createQuiz({
          courseId,
          title: title.trim(),
          description: description.trim(),
          durationMinutes,
          passMark,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          maxAttempts,
          showResultImmediately,
          creationMethod: "MANUAL",
        });
        setDraftQuizId(quiz.id);
      }

      const savedQuestionOrders = new Set(
        (quiz.questions ?? []).map((question) => question.questionOrder),
      );
      for (const [index, question] of questions.entries()) {
        if (savedQuestionOrders.has(index + 1)) continue;
        try {
          await createQuizQuestion(quiz.id, {
            questionText: question.questionText.trim(),
            explanation: question.explanation.trim() || undefined,
            questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER",
            marks: question.marks,
            questionOrder: index + 1,
            options: question.options.map((option, optionIndex) => ({
              optionText: option.trim(),
              correct: optionIndex === question.correctOption,
              optionOrder: optionIndex + 1,
            })),
          });
        } catch (requestError) {
          throw new Error(
            `Question ${index + 1} could not be saved. ${
              requestError instanceof Error ? requestError.message : "Please try again."
            }`,
          );
        }
      }

      const refreshedQuiz = await getQuiz(quiz.id);
      if (!publishImmediately) {
        onQuizCreated(refreshedQuiz);
        onClose();
        return;
      }
      if (passMark > Number(refreshedQuiz.totalMarks)) {
        setError(
          `Publishing failed: pass mark (${passMark}) cannot be greater than total marks (${refreshedQuiz.totalMarks}).`,
        );
        return;
      }
      const finalQuiz = await publishQuiz(refreshedQuiz.id);
      onQuizCreated(finalQuiz);
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Quiz could not be saved. The draft is preserved; retry to continue.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              New assessment
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Create a quiz</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Set the quiz details, then add questions and publish when ready.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close quiz creation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex border-b border-slate-200 px-5 dark:border-slate-800 sm:px-6">
          {(
            [
              ["config", "1. Details"],
              ["questions", "2. Questions"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStep(value)}
              className={`border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${step === value ? "border-indigo-600 text-indigo-700 dark:text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto bg-slate-50/40 p-5 dark:bg-slate-950/20 sm:p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {step === "config" ? (
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Course
                  <select
                    value={courseId}
                    onChange={(event) => setCourseId(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-normal text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} · {course.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quiz Title
                  <input
                    maxLength={150}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. AVL Trees Concept Check"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-normal text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <span className="mt-1 block text-right text-[10px] font-normal text-slate-400">
                    {title.length}/150
                  </span>
                </label>
              </div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="Describe the learning objective and assessment scope..."
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-normal text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="mr-1 inline h-3.5 w-3.5" />
                  Duration (minutes)
                  <input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(event) => setDurationMinutes(Number(event.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-normal text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                  Pass Mark
                  <input
                    type="number"
                    min={0}
                    value={passMark}
                    onChange={(event) => {
                      setPassMarkManuallyEdited(true);
                      setPassMark(Number(event.target.value));
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-normal text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Layers className="mr-1 inline h-3.5 w-3.5" />
                  Max Attempts
                  <input
                    type="number"
                    min={1}
                    value={maxAttempts}
                    onChange={(event) => setMaxAttempts(Number(event.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-normal text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-700">
                  <Calendar className="mr-1 inline h-3.5 w-3.5" />
                  Start Time
                  <input
                    type="datetime-local"
                    min={currentDateTimeInputValue()}
                    value={startTime}
                    onChange={(event) => updateStartTime(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  <Calendar className="mr-1 inline h-3.5 w-3.5" />
                  End Time
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(event) => updateEndTime(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal"
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showResultImmediately}
                  onChange={(event) => setShowResultImmediately(event.target.checked)}
                  className="rounded text-indigo-600"
                />
                Show results immediately after submission
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Question builder
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Move between questions without losing your work.
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {questions.length} question{questions.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((activeQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                <div
                  className="mt-4 flex gap-2 overflow-x-auto pb-1"
                  aria-label="Question navigator"
                >
                  {questions.map((item, index) => {
                    const isComplete = Boolean(
                      item.questionText.trim() && item.options.every((option) => option.trim()),
                    );
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveQuestionIndex(index)}
                        aria-label={`Open question ${index + 1}`}
                        className={`relative flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border px-2 text-xs font-bold transition ${activeQuestionIndex === index ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-500/30" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-700"}`}
                      >
                        {index + 1}
                        {isComplete && activeQuestionIndex !== index && (
                          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                        )}
                      </button>
                    );
                  })}
                  <button
                    onClick={addQuestion}
                    className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-indigo-300 px-2 text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
                    aria-label="Add question"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {(() => {
                const question = questions[activeQuestionIndex];
                const index = activeQuestionIndex;
                return (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Question {index + 1} of {questions.length}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Choose one correct answer
                          </p>
                        </div>
                      </div>
                      {questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(index)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>

                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Question prompt
                      <textarea
                        rows={3}
                        value={question.questionText}
                        onChange={(event) =>
                          updateQuestion(index, { questionText: event.target.value })
                        }
                        placeholder="Write a clear question for your students..."
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </label>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Answer choices
                        </p>
                        <p className="text-[10px] text-slate-400">Select the correct answer</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {question.options.map((option, optionIndex) => {
                          const isCorrect = question.correctOption === optionIndex;
                          return (
                            <label
                              key={optionIndex}
                              className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2 transition ${isCorrect ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/30" : "border-slate-200 bg-slate-50/70 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-indigo-800"}`}
                            >
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={isCorrect}
                                onChange={() =>
                                  updateQuestion(index, { correctOption: optionIndex })
                                }
                                className="h-4 w-4 accent-emerald-600"
                              />
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${isCorrect ? "bg-emerald-600 text-white" : "bg-white text-slate-500 dark:bg-slate-700 dark:text-slate-300"}`}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <input
                                value={option}
                                onChange={(event) =>
                                  updateQuestion(index, {
                                    options: question.options.map((item, itemIndex) =>
                                      itemIndex === optionIndex ? event.target.value : item,
                                    ),
                                  })
                                }
                                aria-label={`Answer choice ${String.fromCharCode(65 + optionIndex)}`}
                                className="min-w-0 flex-1 bg-transparent px-1 py-1 text-xs text-slate-800 outline-none dark:text-slate-100"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr]">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Marks
                        <input
                          type="number"
                          min={1}
                          value={question.marks}
                          onChange={(event) =>
                            updateQuestion(index, { marks: Number(event.target.value) })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </label>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Explanation <span className="font-normal text-slate-400">(optional)</span>
                        <input
                          value={question.explanation}
                          onChange={(event) =>
                            updateQuestion(index, { explanation: event.target.value })
                          }
                          placeholder="Explain the answer for review..."
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </label>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <button
                        disabled={index === 0}
                        onClick={() =>
                          setActiveQuestionIndex((current) => Math.max(0, current - 1))
                        }
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>
                      <button
                        onClick={() => {
                          if (index === questions.length - 1) addQuestion();
                          else setActiveQuestionIndex((current) => current + 1);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                      >
                        {index === questions.length - 1 ? "Add next question" : "Next question"}
                        {index === questions.length - 1 ? (
                          <Plus className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}

              <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-xs text-indigo-800 dark:border-indigo-900/70 dark:bg-indigo-950/50 dark:text-indigo-200">
                {questions.length} question{questions.length === 1 ? "" : "s"} · {totalMarks} total
                marks · exactly one correct answer per question
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xs text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {step === "questions" && (
              <button
                onClick={() => setStep("config")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Back
              </button>
            )}
            {step === "config" ? (
              <button
                onClick={() => {
                  const validationError = validateSettings();
                  if (validationError) {
                    setError(validationError);
                  } else {
                    setError("");
                    setStep("questions");
                  }
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
              >
                Next: Question Bank
              </button>
            ) : (
              <>
                <button
                  disabled={busy}
                  onClick={() => void submit(false)}
                  className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
                >
                  Save as Draft
                </button>
                <button
                  disabled={busy}
                  onClick={() => void submit(true)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {busy ? "Saving..." : "Create & Publish"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

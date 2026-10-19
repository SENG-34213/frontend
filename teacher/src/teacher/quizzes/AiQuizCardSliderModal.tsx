import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Layers,
  Plus,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Course } from "../types";
import {
  createQuiz,
  createQuizQuestion,
  publishQuiz,
  type AiQuizDraft,
  type BackendQuiz,
} from "../api/quizApi";

type DraftQuestion = AiQuizDraft["questions"][number];
interface Props {
  draft: AiQuizDraft;
  initialTitle: string;
  initialDescription: string;
  initialDuration: number;
  initialPassMark: number;
  course?: Course;
  onClose: () => void;
  onRegenerate: () => void;
  onQuizCreated: (quiz: BackendQuiz) => void;
}

export const AiQuizCardSliderModal: React.FC<Props> = ({
  draft,
  initialTitle,
  initialDescription,
  initialDuration,
  initialPassMark,
  course,
  onClose,
  onRegenerate,
  onQuizCreated,
}) => {
  const [questions, setQuestions] = useState<DraftQuestion[]>(draft.questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [duration, setDuration] = useState(initialDuration);
  const [passMark, setPassMark] = useState(initialPassMark);
  const [showSettings, setShowSettings] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const question = questions[currentIndex];
  const totalMarks = questions.reduce((sum, item) => sum + Number(item.marks || 0), 0);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
        return;
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setCurrentIndex((value) => Math.max(0, value - 1));
      if (event.key === "ArrowRight")
        setCurrentIndex((value) => Math.min(questions.length - 1, value + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, questions.length]);

  const updateQuestion = (update: Partial<DraftQuestion>) =>
    setQuestions((items) =>
      items.map((item, index) => (index === currentIndex ? { ...item, ...update } : item)),
    );
  const updateOptions = (update: (options: DraftQuestion["options"]) => DraftQuestion["options"]) =>
    updateQuestion({ options: update(question.options) });
  const validate = () => {
    if (!title.trim()) return "Quiz title is required.";
    if (title.length > 150) return "Quiz title cannot exceed 150 characters.";
    if (duration < 1) return "Quiz duration must be at least 1 minute.";
    if (!questions.length) return "Quiz must contain at least one question.";
    if (passMark > totalMarks) return `Pass mark cannot exceed total marks (${totalMarks}).`;
    for (const [index, item] of questions.entries()) {
      if (!item.questionText.trim()) return `Question #${index + 1} prompt cannot be empty.`;
      if (item.options.length < 4 || item.options.length > 5)
        return `Question #${index + 1} must have 4–5 options.`;
      if (item.options.filter((option) => option.correct).length !== 1)
        return `Question #${index + 1} must have exactly one correct answer.`;
      if (item.options.some((option) => !option.optionText.trim()))
        return `An option in Question #${index + 1} is empty.`;
    }
    return "";
  };
  const persist = async (publish: boolean) => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await createQuiz({
        courseId: draft.courseId,
        title: title.trim(),
        description: description.trim(),
        durationMinutes: duration,
        passMark,
        maxAttempts: 1,
        showResultImmediately: true,
        creationMethod: "AI_GENERATED",
      });
      const savedQuestions = [];
      for (const [index, item] of questions.entries())
        savedQuestions.push(
          await createQuizQuestion(created.id, {
            questionText: item.questionText.trim(),
            questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER",
            marks: Number(item.marks) || 1,
            questionOrder: index + 1,
            options: item.options.map((option, optionIndex) => ({
              optionText: option.optionText.trim(),
              correct: option.correct,
              optionOrder: optionIndex + 1,
            })),
          }),
        );
      const saved = publish ? await publishQuiz(created.id) : created;
      onQuizCreated(saved.questions?.length ? saved : { ...saved, questions: savedQuestions });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Quiz could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  if (!question) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-xl sm:p-5 md:p-8"
    >
      <div className="relative flex h-[92vh] max-h-[860px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/95 text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400" />
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-800 px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-mono text-violet-300">
                  {draft.provider || "AI Generated"}
                </span>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                  {course?.code || "Course"}
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  {draft.difficulty} Difficulty
                </span>
              </div>
              <h1 className="mt-1 truncate text-sm font-bold sm:text-base">{title}</h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Question Card {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] font-mono">
                {Math.round(((currentIndex + 1) / questions.length) * 100)}% Reviewed
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings((value) => !value)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Quiz Settings
              </button>
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>
          </div>
          <div className="mb-5 h-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          {showSettings && (
            <div className="mb-5 grid gap-3 rounded-xl border border-indigo-500/30 bg-slate-800 p-4 md:grid-cols-12">
              <label className="text-xs font-semibold text-slate-300 md:col-span-6">
                Quiz Title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </label>
              <label className="text-xs font-semibold text-slate-300 md:col-span-3">
                Time Limit
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </label>
              <label className="text-xs font-semibold text-slate-300 md:col-span-3">
                Pass Mark
                <input
                  type="number"
                  min={0}
                  value={passMark}
                  onChange={(event) => setPassMark(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </label>
              <label className="text-xs font-semibold text-slate-300 md:col-span-12">
                Description
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </label>
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="relative mb-5 flex items-center justify-between gap-4">
            <button
              disabled={!currentIndex}
              onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
              className="absolute left-0 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800/90 text-xs font-bold shadow-lg disabled:opacity-20"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex max-w-[60%] gap-1.5 overflow-x-auto">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${index === currentIndex ? "bg-indigo-400 ring-4 ring-indigo-500/20" : "bg-slate-600"}`}
                  aria-label={`Question ${index + 1}`}
                />
              ))}
            </div>
            <button
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))}
              className="absolute right-0 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800/90 text-xs font-bold shadow-lg disabled:opacity-20"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <section className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5 shadow-xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-sm font-bold text-indigo-300">
                  {currentIndex + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                    Single Choice Question
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Backend rule: 4–5 choices with 1 verified correct answer
                  </p>
                  <textarea
                    rows={3}
                    value={question.questionText}
                    onChange={(event) => updateQuestion({ questionText: event.target.value })}
                    className="mt-1 w-full resize-none rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                  />
                </div>
              </div>
              <label className="shrink-0 text-[11px] text-slate-400">
                Marks
                <input
                  type="number"
                  min={1}
                  value={question.marks}
                  onChange={(event) => updateQuestion({ marks: Number(event.target.value) })}
                  className="mt-1 w-16 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-center text-xs font-mono font-bold text-indigo-300"
                />
              </label>
            </div>
            <div className="mb-5 pl-11">
              <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Answer options ({question.options.length}/5) · choose the verified answer
                </span>
                {question.options.length < 5 && (
                  <button
                    onClick={() =>
                      updateOptions((items) => [
                        ...items,
                        {
                          optionText: `Alternative option ${items.length + 1}`,
                          correct: false,
                          optionOrder: items.length + 1,
                        },
                      ])
                    }
                    className="flex items-center gap-1 text-xs text-indigo-300"
                  >
                    <Plus className="h-3 w-3" />
                    Add Option
                  </button>
                )}
              </div>
              <div className="space-y-2.5">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    onClick={() =>
                      updateOptions((items) =>
                        items.map((item, itemIndex) => ({
                          ...item,
                          correct: itemIndex === optionIndex,
                        })),
                      )
                    }
                    className={`group flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${option.correct ? "border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40" : "border-slate-700/80 bg-slate-900/60 text-slate-200 hover:bg-slate-900"}`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${option.correct ? "bg-emerald-500 text-slate-950" : "border border-slate-700 bg-slate-800 text-slate-400 group-hover:text-white"}`}
                    >
                      {option.correct ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        String.fromCharCode(65 + optionIndex)
                      )}
                    </div>
                    <input
                      onClick={(event) => event.stopPropagation()}
                      value={option.optionText}
                      onChange={(event) =>
                        updateOptions((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === optionIndex
                              ? { ...item, optionText: event.target.value }
                              : item,
                          ),
                        )
                      }
                      className={`min-w-0 flex-1 border-0 bg-transparent text-xs sm:text-sm font-medium focus:outline-hidden ${option.correct ? "font-bold text-emerald-100" : "text-slate-300"}`}
                    />
                    {option.correct && (
                      <span className="hidden items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold font-mono text-emerald-300 sm:inline-flex">
                        <CheckCircle2 className="h-3 w-3" />
                        Correct Answer
                      </span>
                    )}
                    {question.options.length > 4 && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          updateOptions((items) =>
                            items.filter((_, itemIndex) => itemIndex !== optionIndex),
                          );
                        }}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {option.correct && <Check className="h-4 w-4 shrink-0 text-emerald-400" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="ml-11 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-slate-400">
              <strong className="text-amber-300">AI Pedagogical Rationale: </strong>
              {question.explanation || "No rationale was returned by the AI service."}
            </div>
          </section>
        </main>
        <footer className="flex shrink-0 flex-col justify-between gap-3 border-t border-slate-800 bg-slate-900/95 px-5 py-4 sm:flex-row sm:items-center sm:px-7">
          <div className="text-xs text-slate-400">
            <Award className="mr-1 inline h-4 w-4 text-amber-300" />
            {questions.length} Questions · {totalMarks} Marks · Pass: {passMark}
          </div>
          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={() => void persist(false)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-bold disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              Save as Draft
            </button>
            <button
              disabled={busy}
              onClick={() => void persist(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold disabled:opacity-50"
            >
              {busy ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Publish to Course Students
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

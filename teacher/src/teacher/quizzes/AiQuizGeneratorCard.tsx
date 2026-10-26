import React, { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileCheck,
  FileText,
  Layers,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Course } from "../types";
import {
  createQuiz,
  createQuizQuestion,
  generateAiQuizDraft,
  publishQuiz,
  type AiQuizDraft,
  type BackendQuiz,
} from "../api/quizApi";
import { AiQuizCardSliderModal } from "./AiQuizCardSliderModal";

interface AiQuizGeneratorCardProps {
  courses: Course[];
  onQuizCreated: (quiz: BackendQuiz) => void;
}
type DraftQuestion = AiQuizDraft["questions"][number];

export const AiQuizGeneratorCard: React.FC<AiQuizGeneratorCardProps> = ({
  courses,
  onQuizCreated,
}) => {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState<AiQuizDraft | null>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(25);
  const [passMark, setPassMark] = useState(10);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [showResultImmediately, setShowResultImmediately] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const totalMarks = questions.reduce((total, question) => total + Number(question.marks || 0), 0);

  const updateQuestion = (index: number, next: Partial<DraftQuestion>) =>
    setQuestions((current) =>
      current.map((question, item) => (item === index ? { ...question, ...next } : question)),
    );

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !courseId) {
      setError("Please select a target course and upload a source document.");
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    setProgress(15);
    setProgressText("Analyzing document structure and tokenizing sections...");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("courseId", courseId);
      form.append("questionCount", String(count));
      form.append("difficulty", difficulty);
      form.append("questionType", "MULTIPLE_CHOICE_SINGLE_ANSWER");
      if (prompt.trim()) form.append("userPrompt", prompt.trim());
      setProgress(45);
      setProgressText("Extracting key concepts, formulas, and learning objectives...");
      const result = await generateAiQuizDraft(form);
      setProgress(100);
      setProgressText("Validating backend contract rules and option integrity...");
      setDraft(result);
      setQuestions(result.questions);
      setTitle(
        `${courses.find((course) => course.id === courseId)?.code ?? "Course"} AI Quiz: ${file.name.replace(/\.[^/.]+$/, "")}`,
      );
      setDescription(
        `AI-generated diagnostic assessment from ${file.name}. ${prompt || "Core concepts and learning objectives."}`,
      );
      setPassMark(
        Math.round(
          result.questions.reduce((total, question) => total + Number(question.marks || 0), 0) *
            0.6,
        ),
      );
      setDuration(Math.max(15, result.questions.length * 4));
      setIsSliderOpen(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Failed to generate quiz draft.",
      );
    } finally {
      setBusy(false);
    }
  };

  const validate = () => {
    if (!title.trim()) return "Quiz title is required.";
    if (title.length > 150) return "Quiz title cannot exceed 150 characters.";
    if (!questions.length) return "Quiz must contain at least one question.";
    if (passMark > totalMarks)
      return `Pass mark (${passMark}) cannot be greater than total marks (${totalMarks}).`;
    for (const [index, question] of questions.entries()) {
      if (!question.questionText.trim()) return `Question #${index + 1} prompt cannot be empty.`;
      if (question.options.length < 4 || question.options.length > 5)
        return `Question #${index + 1} must contain between 4 and 5 options.`;
      if (question.options.filter((option) => option.correct).length !== 1)
        return `Question #${index + 1} must have exactly one correct answer.`;
    }
    return "";
  };

  const save = async (shouldPublish: boolean) => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await createQuiz({
        courseId,
        title: title.trim(),
        description: description.trim(),
        durationMinutes: duration,
        passMark,
        maxAttempts: 1,
        showResultImmediately: true,
        creationMethod: "AI_GENERATED",
      });
      const createdQuestions = [];
      for (const [index, question] of questions.entries()) {
        createdQuestions.push(
          await createQuizQuestion(created.id, {
            questionText: question.questionText.trim(),
            explanation: question.explanation?.trim() || undefined,
            questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER",
            marks: Number(question.marks) || 1,
            questionOrder: index + 1,
            options: question.options.map((option, optionIndex) => ({
              optionText: option.optionText.trim(),
              correct: option.correct,
              optionOrder: optionIndex + 1,
            })),
          }),
        );
      }
      const savedQuiz = shouldPublish ? await publishQuiz(created.id) : created;
      onQuizCreated(
        savedQuiz.questions?.length ? savedQuiz : { ...savedQuiz, questions: createdQuestions },
      );
      setSuccess(
        shouldPublish
          ? "Quiz published successfully to enrolled students."
          : "Quiz draft created successfully.",
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Quiz could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setDraft(null);
    setQuestions([]);
    setFile(null);
    setSuccess("");
    setError("");
    setProgress(0);
    setIsSliderOpen(false);
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-200/80 bg-white shadow-md">
      {draft && isSliderOpen && (
        <AiQuizCardSliderModal
          draft={draft}
          initialTitle={title}
          initialDescription={description}
          initialDuration={duration}
          initialPassMark={passMark}
          initialStartTime={startTime}
          initialEndTime={endTime}
          initialMaxAttempts={maxAttempts}
          initialShowResultImmediately={showResultImmediately}
          course={courses.find((course) => course.id === courseId)}
          onClose={() => setIsSliderOpen(false)}
          onRegenerate={reset}
          onQuizCreated={(quiz) => {
            onQuizCreated(quiz);
            setIsSliderOpen(false);
          }}
        />
      )}
      <div className="p-6">
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {success}
          </div>
        )}
        {!draft ? (
          <form onSubmit={generate} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              <div className="space-y-4 md:col-span-7">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      Source Course Document <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      PDF, DOCX, TXT, PPTX (Max 25MB)
                    </span>
                  </div>
                  <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const dropped = event.dataTransfer.files[0];
                      if (dropped) setFile(dropped);
                    }}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${file ? "border-emerald-400 bg-emerald-50/30" : "border-slate-300 bg-slate-50/60 hover:border-indigo-400"}`}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.pptx,.ppt"
                      onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    {file ? (
                      <div className="flex items-center justify-between gap-3 text-left">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <FileCheck className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-900">{file.name}</p>
                            <p className="mt-0.5 text-[11px] font-mono text-slate-500">
                              {(file.size / 1024).toFixed(1)} KB · Ready for AI analysis
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setFile(null);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                          <Upload className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700">
                          Click to browse or drag and drop course documents here
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Your document will be processed securely
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-800">
                    Target Focus Area / Prompt (Optional)
                    <span className="text-[10px] font-normal lowercase text-slate-400">
                      userPrompt parameter
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="e.g. Generate questions focusing on time complexity, edge cases, and rotation invariants..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-4 md:col-span-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  Target Course (courseId)
                  <select
                    value={courseId}
                    onChange={(event) => setCourseId(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} — {course.title}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Question Count: <span className="text-indigo-600">{count}</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">1 – 20 max</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[3, 5, 10, 15, 20].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCount(value)}
                        className={`flex-1 rounded-lg border py-1.5 text-xs font-mono font-bold ${count === value ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-700"}`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-800">
                    Difficulty Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ["EASY", "Easy", "Recall & Defs"],
                        ["MEDIUM", "Medium", "Application"],
                        ["HARD", "Hard", "Proofs & Bounds"],
                      ] as const
                    ).map(([value, label, detail]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setDifficulty(value)}
                        className={`rounded-xl border p-2.5 text-center ${difficulty === value ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600" : "border-slate-200 bg-white text-slate-600"}`}
                      >
                        <div className="text-xs font-bold">{label}</div>
                        <div className="mt-0.5 text-[10px] text-slate-400">{detail}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Question Format:</span>
                    <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-mono font-bold text-indigo-700">
                      MULTIPLE_CHOICE_SINGLE_ANSWER
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Exactly 4 to 5 options per question with 1 verified correct answer.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={busy || !file}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating Quiz Draft ({progress}%)...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      Generate Quiz Draft with AI
                    </>
                  )}
                </button>
              </div>
            </div>
            {busy && (
              <div className="space-y-2 rounded-xl border border-indigo-200/80 bg-indigo-50/70 p-4">
                <div className="flex justify-between text-xs font-semibold text-indigo-900">
                  <span>{progressText}</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
                    <Sparkles className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-violet-200 bg-violet-100 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-violet-800">
                        {draft.provider || "Question builder"}
                      </span>
                      <span className="rounded-full border border-indigo-200 bg-indigo-100 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-800">
                        {courses.find((course) => course.id === courseId)?.code || "Course"}
                      </span>
                      <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                        {draft.difficulty} Difficulty
                      </span>
                      <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-800">
                        Draft
                      </span>
                    </div>
                    <h3 className="text-base font-bold tracking-tight text-slate-900">{title}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Duration: <strong className="text-slate-700">{duration} mins</strong> · Total
                      Marks: <strong className="text-slate-700">{totalMarks}</strong> · 0 student
                      attempts
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Synthesized from &quot;{file?.name}&quot;. Review the generated questions in
                      the card slider above the page.
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <button
                    type="button"
                    onClick={reset}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    New Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSliderOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    Open Question Card Slider ({questions.length})
                  </button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Total Questions
                  </span>
                  <p className="mt-0.5 text-lg font-bold font-mono text-slate-900">
                    {questions.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Total Marks
                  </span>
                  <p className="mt-0.5 text-lg font-bold font-mono text-indigo-600">
                    {totalMarks} pts
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Duration</span>
                  <p className="mt-0.5 text-lg font-bold font-mono text-slate-900">
                    {duration} mins
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Attempts</span>
                  <p className="mt-0.5 text-lg font-bold font-mono text-slate-900">0</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-violet-200 bg-violet-100 px-2.5 py-1 text-xs font-mono font-bold text-violet-800">
                  {draft.provider || "Question builder"}
                </span>
                <span className="rounded-md border border-indigo-200 bg-indigo-100 px-2.5 py-1 text-xs font-mono font-bold text-indigo-800">
                  Difficulty: {draft.difficulty}
                </span>
                <span className="rounded-md border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-mono font-bold text-emerald-800">
                  {questions.length} Questions · {totalMarks} Total Marks
                </span>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Discard &amp; Re-generate
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-12">
              <div className="md:col-span-6">
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Quiz Title ({title.length}/150)
                </label>
                <input
                  maxLength={150}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div className="md:col-span-3">
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Time Limit (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div className="md:col-span-3">
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Pass Mark (Points)
                </label>
                <input
                  type="number"
                  min={0}
                  max={totalMarks}
                  value={passMark}
                  onChange={(event) => setPassMark(Number(event.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div className="md:col-span-12">
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Description &amp; Student Guidance
                </label>
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  Generated Questions ({questions.length})
                </h3>
                <span className="text-[11px] text-slate-500">
                  Select the radio button next to an option to designate the single correct answer.
                </span>
              </div>
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-indigo-100 bg-indigo-50 text-xs font-bold text-indigo-700">
                        {index + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={question.questionText}
                        onChange={(event) =>
                          updateQuestion(index, { questionText: event.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-400">
                        Marks
                        <input
                          type="number"
                          min={1}
                          value={question.marks}
                          onChange={(event) =>
                            updateQuestion(index, { marks: Number(event.target.value) })
                          }
                          className="ml-1 w-14 rounded-md border border-slate-200 px-2 py-1 text-center text-xs font-mono font-bold text-indigo-700"
                        />
                      </label>
                      <button
                        onClick={() =>
                          setQuestions((current) => current.filter((_, item) => item !== index))
                        }
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 pl-8">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Options ({question.options.length}/5 — 1 correct required)</span>
                      {question.options.length < 5 && (
                        <button
                          onClick={() =>
                            updateQuestion(index, {
                              options: [
                                ...question.options,
                                {
                                  optionText: `New option ${question.options.length + 1}`,
                                  correct: false,
                                  optionOrder: question.options.length + 1,
                                },
                              ],
                            })
                          }
                          className="flex items-center gap-1 text-xs text-indigo-600"
                        >
                          <Plus className="h-3 w-3" />
                          Add Option
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs ${option.correct ? "border-emerald-300 bg-emerald-50/70 ring-1 ring-emerald-400/40" : "border-slate-200 bg-slate-50"}`}
                        >
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={option.correct}
                            onChange={() =>
                              updateQuestion(index, {
                                options: question.options.map((item, itemIndex) => ({
                                  ...item,
                                  correct: itemIndex === optionIndex,
                                })),
                              })
                            }
                            className="text-emerald-600"
                          />
                          <input
                            value={option.optionText}
                            onChange={(event) =>
                              updateQuestion(index, {
                                options: question.options.map((item, itemIndex) =>
                                  itemIndex === optionIndex
                                    ? { ...item, optionText: event.target.value }
                                    : item,
                                ),
                              })
                            }
                            className={`flex-1 border-0 bg-transparent text-xs focus:outline-hidden ${option.correct ? "font-bold text-emerald-950" : "text-slate-800"}`}
                          />
                          {question.options.length > 4 && (
                            <button
                              onClick={() =>
                                updateQuestion(index, {
                                  options: question.options
                                    .filter((_, itemIndex) => itemIndex !== optionIndex)
                                    .map((item, itemIndex) => ({
                                      ...item,
                                      optionOrder: itemIndex + 1,
                                    })),
                                })
                              }
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {question.explanation && (
                    <div className="pl-8 pt-1">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-500">
                        <strong className="text-slate-700">AI Pedagogical Rationale: </strong>
                        {question.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
              <div className="text-xs text-slate-500">
                Total:{" "}
                <strong className="font-mono text-slate-900">
                  {questions.length} Questions · {totalMarks} Marks · Pass: {passMark} Marks
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={busy}
                  onClick={() => void save(false)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  disabled={busy}
                  onClick={() => void save(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Publish to Course Students
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

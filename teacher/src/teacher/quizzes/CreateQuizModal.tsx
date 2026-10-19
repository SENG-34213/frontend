import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, CheckCircle2, Clock, Layers, Plus, Trash2, X } from "lucide-react";
import { Course } from "../types";
import { createQuiz, createQuizQuestion, publishQuiz, type BackendQuiz } from "../api/quizApi";

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

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  courses,
  onClose,
  onQuizCreated,
}) => {
  const [step, setStep] = useState<"config" | "questions">("config");
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passMark, setPassMark] = useState(15);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [showResultImmediately, setShowResultImmediately] = useState(true);
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setCourseId(courses[0]?.id ?? "");
    setStep("config");
    setTitle("");
    setDescription("");
    setDurationMinutes(30);
    setPassMark(15);
    setStartTime("");
    setEndTime("");
    setMaxAttempts(1);
    setShowResultImmediately(true);
    setQuestions([blankQuestion()]);
    setError("");
  }, [isOpen, courses]);

  const totalMarks = useMemo(() => questions.reduce((sum, question) => sum + Number(question.marks || 0), 0), [questions]);

  const updateQuestion = (index: number, update: Partial<DraftQuestion>) => {
    setQuestions((current) => current.map((question, questionIndex) => questionIndex === index ? { ...question, ...update } : question));
  };

  const validate = () => {
    if (!courseId) return "Select a course.";
    if (!title.trim()) return "Quiz title is required.";
    if (title.trim().length > 150) return "Quiz title cannot exceed 150 characters.";
    if (durationMinutes < 1) return "Duration must be at least 1 minute.";
    if (maxAttempts < 1) return "Maximum attempts must be at least 1.";
    if (passMark > totalMarks) return `Pass mark (${passMark}) cannot be greater than total marks (${totalMarks}).`;
    if (questions.some((question) => !question.questionText.trim())) return "Every question needs a prompt.";
    if (questions.some((question) => question.options.some((option) => !option.trim()))) return "Every answer choice must have text.";
    return "";
  };

  const submit = async (publishImmediately: boolean) => {
    const validationError = validate();
    if (validationError) { setError(validationError); setStep(validationError.includes("question") || validationError.includes("choice") ? "questions" : step); return; }
    setBusy(true); setError("");
    try {
      const created = await createQuiz({
        courseId, title: title.trim(), description: description.trim(), durationMinutes,
        passMark, startTime: startTime || undefined, endTime: endTime || undefined,
        maxAttempts, showResultImmediately, creationMethod: "MANUAL",
      });
      for (const [index, question] of questions.entries()) {
        await createQuizQuestion(created.id, {
          questionText: question.questionText.trim(), questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER",
          marks: Number(question.marks) || 1, questionOrder: index + 1,
          options: question.options.map((option, optionIndex) => ({ optionText: option.trim(), correct: optionIndex === question.correctOption, optionOrder: optionIndex + 1 })),
        });
      }
      const finalQuiz = publishImmediately ? await publishQuiz(created.id) : created;
      onQuizCreated(finalQuiz);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Quiz could not be created.");
    } finally { setBusy(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-6 py-4">
          <div><div className="flex items-center gap-2"><h2 className="text-base font-bold text-slate-900">Create New Academic Quiz</h2><span className="rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-700">CreateQuizRequest</span></div><p className="text-xs text-slate-500">Build an automated grading assessment aligned to the backend quiz contract.</p></div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex border-b border-slate-200 px-6">
          {([['config', '1. Quiz Settings & Constraints'], ['questions', '2. Question Bank']] as const).map(([value, label]) => <button key={value} onClick={() => setStep(value)} className={`border-b-2 px-4 py-3 text-xs font-semibold ${step === value ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400'}`}>{label}</button>)}
        </div>
        <div className="overflow-y-auto p-6">
          {error && <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"><AlertCircle className="h-4 w-4" />{error}</div>}
          {step === "config" ? <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">Course<select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal"><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</select></label>
              <label className="text-xs font-semibold text-slate-700">Quiz Title<input maxLength={150} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. AVL Trees Concept Check" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal" /><span className="mt-1 block text-right text-[10px] font-normal text-slate-400">{title.length}/150</span></label>
            </div>
            <label className="block text-xs font-semibold text-slate-700">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Describe the learning objective and assessment scope..." className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal" /></label>
            <div className="grid gap-4 sm:grid-cols-3"><label className="text-xs font-semibold text-slate-700"><Clock className="mr-1 inline h-3.5 w-3.5" />Duration (minutes)<input type="number" min={1} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal" /></label><label className="text-xs font-semibold text-slate-700"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />Pass Mark<input type="number" min={0} value={passMark} onChange={(event) => setPassMark(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal" /></label><label className="text-xs font-semibold text-slate-700"><Layers className="mr-1 inline h-3.5 w-3.5" />Max Attempts<input type="number" min={1} value={maxAttempts} onChange={(event) => setMaxAttempts(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal" /></label></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-700"><Calendar className="mr-1 inline h-3.5 w-3.5" />Start Time<input type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal" /></label><label className="text-xs font-semibold text-slate-700"><Calendar className="mr-1 inline h-3.5 w-3.5" />End Time<input type="datetime-local" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal" /></label></div>
            <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={showResultImmediately} onChange={(event) => setShowResultImmediately(event.target.checked)} className="rounded text-indigo-600" />Show results immediately after submission</label>
          </div> : <div className="space-y-4">
            {questions.map((question, index) => <div key={index} className="rounded-xl border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold text-slate-800">Question {index + 1}</span>{questions.length > 1 && <button onClick={() => setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-xs text-rose-600"><Trash2 className="mr-1 inline h-3.5 w-3.5" />Remove</button>}</div><textarea rows={2} value={question.questionText} onChange={(event) => updateQuestion(index, { questionText: event.target.value })} placeholder="Question Prompt" className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" /><div className="grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <div key={optionIndex} className="flex items-center gap-2"><input type="radio" name={`correct-${index}`} checked={question.correctOption === optionIndex} onChange={() => updateQuestion(index, { correctOption: optionIndex })} /><input value={option} onChange={(event) => updateQuestion(index, { options: question.options.map((item, itemIndex) => itemIndex === optionIndex ? event.target.value : item) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" /></div>)}</div><div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]"><input type="number" min={1} value={question.marks} onChange={(event) => updateQuestion(index, { marks: Number(event.target.value) })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Marks" /><input value={question.explanation} onChange={(event) => updateQuestion(index, { explanation: event.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Pedagogical Explanation (Shown in Review)" /></div></div>)}
            <button onClick={() => setQuestions((current) => [...current, blankQuestion()])} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700"><Plus className="h-4 w-4" />Add Question</button>
            <div className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-800">{questions.length} question{questions.length === 1 ? "" : "s"} · {totalMarks} total marks · exactly one correct answer per question</div>
          </div>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4"><button onClick={onClose} className="rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-100">Cancel</button><div className="flex gap-2">{step === "questions" && <button onClick={() => setStep("config")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700">Back</button>}{step === "config" ? <button onClick={() => { const validationError = validate(); if (validationError && !validationError.includes("question") && !validationError.includes("choice")) setError(validationError); else { setError(""); setStep("questions"); } }} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">Next: Question Bank</button> : <><button disabled={busy} onClick={() => void submit(false)} className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 disabled:opacity-50">Save as Draft</button><button disabled={busy} onClick={() => void submit(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Saving..." : "Create & Publish"}</button></>}</div></div>
      </div>
    </div>
  );
};

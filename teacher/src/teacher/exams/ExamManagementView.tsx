import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Plus, Save, X } from "lucide-react";
import { Course, NavigationTab } from "../types";
import {
  cancelExam,
  completeExam,
  createExam,
  enterExamMarks,
  getExamResultSheet,
  getExamSummary,
  scheduleExam,
  startExamMarking,
  updateExam,
  type BackendExam,
  type ExamResult,
  type ExamResultSheet,
  type ExamSummary,
} from "../api/examApi";
import { useTeacherExams } from "../hooks/useTeacherExams";
import { StatusBadge } from "../components/StatusBadge";

type Props = { teacherCourses: Course[]; onNavigate: (tab: NavigationTab) => void };
type ExamForm = {
  courseId: string;
  title: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: string;
  passMarks: string;
  type: "MIDTERM" | "FINAL" | "PRACTICAL" | "OTHER";
};

const blankForm = (courseId: string): ExamForm => ({
  courseId,
  title: "",
  examDate: "",
  startTime: "09:00",
  endTime: "11:00",
  totalMarks: "100",
  passMarks: "40",
  type: "MIDTERM",
});

export const ExamManagementView: React.FC<Props> = ({ teacherCourses, onNavigate }) => {
  const examState = useTeacherExams(teacherCourses);
  const [exams, setExams] = useState<BackendExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<BackendExam | null>(null);
  const [form, setForm] = useState(() => blankForm(teacherCourses[0]?.id ?? ""));
  const [createOpen, setCreateOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<BackendExam | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [sheet, setSheet] = useState<ExamResultSheet | null>(null);
  const [summary, setSummary] = useState<ExamSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setExams(examState.exams);
    setSelectedExam((current) =>
      current ? (examState.exams.find((exam) => exam.id === current.id) ?? null) : null,
    );
  }, [examState.exams]);

  const coursesById = useMemo(
    () => new Map(teacherCourses.map((course) => [course.id, course])),
    [teacherCourses],
  );

  const runTransition = async (
    exam: BackendExam,
    transition: () => Promise<BackendExam | undefined>,
  ) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await transition();
      if (updated) {
        setExams((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        setSelectedExam(updated);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Exam transition failed.");
    } finally {
      setSaving(false);
    }
  };

  const openResults = async (exam: BackendExam) => {
    setSelectedExam(exam);
    setError(null);
    try {
      const [nextSheet, nextSummary] = await Promise.all([
        getExamResultSheet(exam.id),
        getExamSummary(exam.id),
      ]);
      setSheet(nextSheet ?? null);
      setSummary(nextSummary ?? null);
      setResults(nextSheet?.results ?? []);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Exam results failed to load.",
      );
    }
  };

  const saveMarks = async () => {
    if (!selectedExam || selectedExam.status !== "MARKING") return;
    setSaving(true);
    setError(null);
    try {
      const invalidResult = results.find(
        (result) =>
          (result.attendanceStatus === "PRESENT" &&
            (result.marksObtained === undefined ||
              result.marksObtained < 0 ||
              result.marksObtained > selectedExam.totalMarks)) ||
          (result.attendanceStatus === "ABSENT" && result.marksObtained !== undefined),
      );
      if (invalidResult) {
        setError(
          "Present students need marks within the exam range; absent students cannot have marks.",
        );
        return;
      }
      await enterExamMarks(selectedExam.id, results);
      await openResults(selectedExam);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Marks could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const totalMarks = Number(form.totalMarks);
    const passMarks = Number(form.passMarks);
    if (
      !form.courseId ||
      !form.title.trim() ||
      !form.examDate ||
      form.endTime <= form.startTime ||
      totalMarks <= 0 ||
      passMarks < 0 ||
      passMarks > totalMarks
    ) {
      setError("Complete the required fields and use valid marks and times.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        examDate: form.examDate,
        startTime: form.startTime,
        endTime: form.endTime,
        totalMarks,
        passMarks,
        type: form.type,
      };
      if (editingExam) {
        const updated = await updateExam(editingExam.id, payload);
        if (updated) {
          setExams((current) => current.map((item) => (item.id === updated.id ? updated : item)));
          setSelectedExam(updated);
        }
      } else {
        const created = await createExam({ ...payload, courseId: form.courseId });
        if (created) setExams((current) => [created, ...current]);
      }
      setCreateOpen(false);
      setEditingExam(null);
      setForm(blankForm(teacherCourses[0]?.id ?? ""));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Exam could not be created.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Examination Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Schedule exams, manage state transitions, and enter results.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule New Exam
        </button>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          {error}
        </div>
      )}
      {examState.error && !error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          {examState.error.message}{" "}
          <button type="button" onClick={examState.retry} className="ml-2 font-semibold underline">
            Retry
          </button>
        </div>
      )}
      {examState.isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Loading exams…
        </div>
      )}
      {!examState.isLoading && !examState.error && exams.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
          No exams have been created for your courses yet.
        </div>
      )}

      <div className="space-y-4">
        {exams.map((exam) => {
          const course = coursesById.get(exam.courseId);
          return (
            <article
              key={exam.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {course?.code ?? "COURSE"}
                  </span>
                  <span className="text-xs text-slate-500">{exam.type}</span>
                  <StatusBadge status={displayStatus(exam.status)} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{exam.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {exam.examDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {exam.startTime}–{exam.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Teacher-managed course
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(exam.status === "DRAFT" || exam.status === "SCHEDULED") && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setEditingExam(exam);
                      setForm({
                        courseId: exam.courseId,
                        title: exam.title,
                        examDate: exam.examDate,
                        startTime: exam.startTime,
                        endTime: exam.endTime,
                        totalMarks: String(exam.totalMarks),
                        passMarks: String(exam.passMarks),
                        type: exam.type,
                      });
                      setCreateOpen(true);
                    }}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    Edit
                  </button>
                )}
                <TransitionButton exam={exam} saving={saving} onTransition={runTransition} />
                <button
                  type="button"
                  onClick={() => void openResults(exam)}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  Results sheet
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {sheet && selectedExam && (
        <ResultsPanel
          exam={selectedExam}
          sheet={sheet}
          summary={summary}
          results={results}
          readOnly={selectedExam.status !== "MARKING"}
          saving={saving}
          onResultsChange={setResults}
          onSave={saveMarks}
          onClose={() => setSheet(null)}
        />
      )}
      {createOpen && (
        <CreateExamModal
          form={form}
          courses={teacherCourses}
          saving={saving}
          editing={Boolean(editingExam)}
          onChange={setForm}
          onSubmit={submitCreate}
          onClose={() => {
            setCreateOpen(false);
            setEditingExam(null);
          }}
        />
      )}
      <button
        type="button"
        onClick={() => onNavigate("grades")}
        className="text-xs text-indigo-600 hover:underline"
      >
        Open gradebook (backend gradebook API is not available yet)
      </button>
    </div>
  );
};

function displayStatus(status: BackendExam["status"]) {
  return status === "MARKING"
    ? "Grading"
    : status === "COMPLETED"
      ? "Completed"
      : status === "CANCELLED"
        ? "Cancelled"
        : status === "DRAFT"
          ? "Draft"
          : "Scheduled";
}

function TransitionButton({
  exam,
  saving,
  onTransition,
}: {
  exam: BackendExam;
  saving: boolean;
  onTransition: (exam: BackendExam, transition: () => Promise<BackendExam | undefined>) => void;
}) {
  if (exam.status === "DRAFT")
    return (
      <>
        <button
          type="button"
          disabled={saving}
          onClick={() => void onTransition(exam, () => scheduleExam(exam.id))}
          className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg"
        >
          Schedule
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void onTransition(exam, () => cancelExam(exam.id))}
          className="px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 rounded-lg"
        >
          Cancel
        </button>
      </>
    );
  if (exam.status === "SCHEDULED")
    return (
      <>
        <button
          type="button"
          disabled={saving}
          onClick={() => void onTransition(exam, () => startExamMarking(exam.id))}
          className="px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg"
        >
          Start marking
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void onTransition(exam, () => cancelExam(exam.id))}
          className="px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 rounded-lg"
        >
          Cancel
        </button>
      </>
    );
  if (exam.status === "MARKING")
    return (
      <button
        type="button"
        disabled={saving}
        onClick={() => void onTransition(exam, () => completeExam(exam.id))}
        className="px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg"
      >
        Complete
      </button>
    );
  return null;
}

function CreateExamModal({
  form,
  courses,
  saving,
  editing,
  onChange,
  onSubmit,
  onClose,
}: {
  form: ExamForm;
  courses: Course[];
  saving: boolean;
  editing: boolean;
  onChange: React.Dispatch<React.SetStateAction<ExamForm>>;
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
}) {
  const inputClass = "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-xl rounded-xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {editing ? "Edit Exam" : "Schedule New Exam"}
          </h2>
          <button type="button" onClick={onClose}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Course">
            <select
              required
              disabled={editing}
              value={form.courseId}
              onChange={(event) =>
                onChange((current) => ({ ...current, courseId: event.target.value }))
              }
              className={inputClass}
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select
              value={form.type}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  type: event.target.value as ExamForm["type"],
                }))
              }
              className={inputClass}
            >
              <option value="MIDTERM">Midterm</option>
              <option value="FINAL">Final</option>
              <option value="PRACTICAL">Practical</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
          <Field label="Title" className="sm:col-span-2">
            <input
              required
              value={form.title}
              onChange={(event) =>
                onChange((current) => ({ ...current, title: event.target.value }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="Exam date">
            <input
              required
              type="date"
              value={form.examDate}
              onChange={(event) =>
                onChange((current) => ({ ...current, examDate: event.target.value }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="Start time">
            <input
              required
              type="time"
              value={form.startTime}
              onChange={(event) =>
                onChange((current) => ({ ...current, startTime: event.target.value }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="End time">
            <input
              required
              type="time"
              value={form.endTime}
              onChange={(event) =>
                onChange((current) => ({ ...current, endTime: event.target.value }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="Total marks">
            <input
              required
              min="1"
              type="number"
              value={form.totalMarks}
              onChange={(event) =>
                onChange((current) => ({ ...current, totalMarks: event.target.value }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="Pass marks">
            <input
              required
              min="0"
              type="number"
              value={form.passMarks}
              onChange={(event) =>
                onChange((current) => ({ ...current, passMarks: event.target.value }))
              }
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-xs text-slate-600">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving…" : editing ? "Save changes" : "Create exam"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`text-xs font-semibold text-slate-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

function ResultsPanel({
  exam,
  sheet,
  summary,
  results,
  readOnly,
  saving,
  onResultsChange,
  onSave,
  onClose,
}: {
  exam: BackendExam;
  sheet: ExamResultSheet;
  summary: ExamSummary | null;
  results: ExamResult[];
  readOnly: boolean;
  saving: boolean;
  onResultsChange: (results: ExamResult[]) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const updateResult = (index: number, patch: Partial<ExamResult>) =>
    onResultsChange(
      results.map((result, resultIndex) =>
        resultIndex === index ? { ...result, ...patch } : result,
      ),
    );
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-auto rounded-xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{exam.title} results</h2>
            <p className="text-xs text-slate-500">
              {readOnly
                ? "Results are read-only."
                : "Marks can be entered while the exam is in MARKING."}
            </p>
          </div>
          <button type="button" onClick={onClose}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              ["Students", summary.totalStudents],
              ["Present", summary.presentStudents],
              ["Absent", summary.absentStudents],
              ["Passed", summary.passedStudents],
              ["Failed", summary.failedStudents],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-slate-200 p-3 text-xs">
                <span className="block text-slate-500">{label}</span>
                <strong className="text-base text-slate-900">{value}</strong>
              </div>
            ))}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 text-left">Student ID</th>
                <th className="p-2 text-left">Attendance</th>
                <th className="p-2 text-left">Marks / {sheet.totalMarks}</th>
                <th className="p-2 text-left">Result</th>
                <th className="p-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((result, index) => (
                <tr key={result.studentId}>
                  <td className="p-2 font-mono">{result.studentId}</td>
                  <td className="p-2">
                    <select
                      disabled={readOnly}
                      value={result.attendanceStatus}
                      onChange={(event) =>
                        updateResult(index, {
                          attendanceStatus: event.target.value as ExamResult["attendanceStatus"],
                          marksObtained:
                            event.target.value === "ABSENT" ? undefined : result.marksObtained,
                        })
                      }
                      className="rounded border border-slate-200 px-2 py-1"
                    >
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      disabled={readOnly || result.attendanceStatus === "ABSENT"}
                      type="number"
                      min="0"
                      max={sheet.totalMarks}
                      step="0.01"
                      value={result.marksObtained ?? ""}
                      onChange={(event) =>
                        updateResult(index, {
                          marksObtained:
                            event.target.value === "" ? undefined : Number(event.target.value),
                        })
                      }
                      className="w-24 rounded border border-slate-200 px-2 py-1"
                    />
                  </td>
                  <td className="p-2">{result.resultStatus}</td>
                  <td className="p-2">
                    <input
                      disabled={readOnly}
                      value={result.remarks ?? ""}
                      onChange={(event) => updateResult(index, { remarks: event.target.value })}
                      className="w-full rounded border border-slate-200 px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
          >
            {saving ? "Saving…" : "Save marks"}
          </button>
        )}
      </div>
    </div>
  );
}

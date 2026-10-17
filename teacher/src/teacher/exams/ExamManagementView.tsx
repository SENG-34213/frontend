"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, Edit3, Loader2, Plus, Save, X } from "lucide-react";
import type { BackendCourse } from "../api/courseApi";
import {
  cancelExam,
  completeExam,
  createExam,
  enterExamMarks,
  getCourseExams,
  getExamResults,
  getExamSummary,
  scheduleExam,
  startExamMarking,
  updateExam,
  type BackendExam,
  type ExamAttendanceStatus,
  type ExamDraft,
  type ExamResult,
  type ExamMarkEntry,
  type ExamSummary,
  type ExamType,
} from "../api/examApi";
import type { Course } from "../types";

type ExamManagementViewProps = {
  backendCourses: BackendCourse[];
  courses: Course[];
};
type ExamForm = ExamDraft;

const initialForm = (courseId = ""): ExamForm => ({
  courseId,
  title: "",
  description: "",
  examDate: new Date().toISOString().slice(0, 10),
  startTime: "10:00",
  endTime: "12:00",
  totalMarks: 100,
  passMarks: 40,
  type: "MIDTERM",
});

function numberValue(value: number | string | undefined) {
  return value === undefined ? "—" : Number(value).toFixed(2).replace(/\.00$/, "");
}

function displayTime(value: string) {
  return value.length > 5 ? value.slice(0, 5) : value;
}

export const ExamManagementView: React.FC<ExamManagementViewProps> = ({
  backendCourses,
  courses,
}) => {
  const [exams, setExams] = useState<BackendExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<BackendExam | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [summary, setSummary] = useState<ExamSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<BackendExam | null>(null);
  const [form, setForm] = useState<ExamForm>(initialForm(backendCourses[0]?.id));

  const courseById = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );
  const canEdit = selectedExam?.status === "DRAFT";
  const canSchedule = selectedExam?.status === "DRAFT";
  const canStartMarking = selectedExam?.status === "SCHEDULED";
  const canComplete = selectedExam?.status === "MARKING";
  const canCancel = Boolean(
    selectedExam && !["COMPLETED", "CANCELLED"].includes(selectedExam.status),
  );

  async function loadExams() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await Promise.all(backendCourses.map((course) => getCourseExams(course.id)));
      const next = response.flat();
      setExams(next);
      if (selectedExam) {
        const refreshed = next.find((exam) => exam.id === selectedExam.id);
        if (refreshed) await selectExam(refreshed);
      } else if (next[0]) {
        await selectExam(next[0]);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Exams failed to load.");
    } finally {
      setIsLoading(false);
    }
  }

  async function selectExam(exam: BackendExam) {
    setSelectedExam(exam);
    setIsResultsLoading(true);
    setError(null);
    try {
      const [resultSheet, examSummary] = await Promise.all([
        getExamResults(exam.id),
        getExamSummary(exam.id),
      ]);
      setResults(resultSheet?.results ?? []);
      setSummary(examSummary ?? null);
    } catch (requestError) {
      setResults([]);
      setSummary(null);
      setError(
        requestError instanceof Error ? requestError.message : "Exam results failed to load.",
      );
    } finally {
      setIsResultsLoading(false);
    }
  }

  useEffect(() => {
    if (backendCourses.length) void loadExams();
    else setIsLoading(false);
    // loadExams intentionally runs when the authenticated course list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendCourses]);

  function openCreate() {
    setEditingExam(null);
    setForm(initialForm(backendCourses[0]?.id));
    setShowForm(true);
  }

  function openEdit() {
    if (!selectedExam || !canEdit) return;
    setEditingExam(selectedExam);
    setForm({
      courseId: selectedExam.courseId,
      title: selectedExam.title,
      description: selectedExam.description ?? "",
      examDate: selectedExam.examDate,
      startTime: selectedExam.startTime.slice(0, 5),
      endTime: selectedExam.endTime.slice(0, 5),
      totalMarks: Number(selectedExam.totalMarks),
      passMarks: Number(selectedExam.passMarks),
      type: selectedExam.type,
    });
    setShowForm(true);
  }

  async function saveExam(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || form.endTime <= form.startTime || form.passMarks > form.totalMarks) {
      setError(
        "Enter a title, an end time after the start time, and pass marks within total marks.",
      );
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const saved = editingExam
        ? await updateExam(editingExam.id, {
            title: form.title,
            description: form.description,
            examDate: form.examDate,
            startTime: form.startTime,
            endTime: form.endTime,
            totalMarks: form.totalMarks,
            passMarks: form.passMarks,
            type: form.type,
          })
        : await createExam(form);
      if (saved) {
        setExams((current) =>
          editingExam
            ? current.map((exam) => (exam.id === saved.id ? saved : exam))
            : [saved, ...current],
        );
        setShowForm(false);
        setNotice(editingExam ? "Exam updated." : "Exam created as a draft.");
        await selectExam(saved);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Exam could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function transition(action: "schedule" | "marking" | "complete" | "cancel") {
    if (!selectedExam) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated =
        action === "schedule"
          ? await scheduleExam(selectedExam.id)
          : action === "marking"
            ? await startExamMarking(selectedExam.id)
            : action === "complete"
              ? await completeExam(selectedExam.id)
              : await cancelExam(selectedExam.id);
      if (updated) {
        setExams((current) => current.map((exam) => (exam.id === updated.id ? updated : exam)));
        await selectExam(updated);
      }
      const transitionLabel =
        action === "marking"
          ? "moved to marking"
          : action === "schedule"
            ? "scheduled"
            : action === "complete"
              ? "completed"
              : "cancelled";
      setNotice(`Exam ${transitionLabel}.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Exam state transition failed.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function saveMarks() {
    if (!selectedExam || selectedExam.status !== "MARKING") return;
    const invalid = results.some(
      (result) =>
        result.marksObtained !== undefined &&
        Number(result.marksObtained) > Number(selectedExam.totalMarks),
    );
    if (
      invalid ||
      results.some(
        (result) => result.marksObtained !== undefined && Number(result.marksObtained) < 0,
      )
    ) {
      setError("Marks must be between 0 and the exam total.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const response = await enterExamMarks(
        selectedExam.id,
        results.map(
          ({ studentId, attendanceStatus, marksObtained, remarks }): ExamMarkEntry => ({
            studentId,
            attendanceStatus,
            marksObtained,
            remarks,
          }),
        ),
      );
      if (response?.results) setResults(response.results);
      setNotice(`${response?.updatedCount ?? results.length} mark records saved.`);
      const refreshed = { ...selectedExam, status: "MARKING" as const };
      setSelectedExam(refreshed);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Exam marks could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function updateResult(index: number, patch: Partial<ExamResult>) {
    setResults((current) =>
      current.map((result, resultIndex) =>
        resultIndex === index ? { ...result, ...patch } : result,
      ),
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Examination Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, schedule, mark, and complete your course examinations.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> New exam
        </button>
      </div>
      {notice && (
        <div className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5" />
          {notice}
        </div>
      )}
      {error && (
        <div className="px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
          <button onClick={() => void loadExams()} className="ml-3 underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-5">
        <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Course exams</h2>
            <span className="text-xs text-slate-500">{exams.length} total</span>
          </div>
          {isLoading ? (
            <div className="p-10 text-center text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Loading exams...
            </div>
          ) : exams.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No exams found. Create your first draft.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {exams.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => void selectExam(exam)}
                  className={`w-full text-left p-4 hover:bg-slate-50 ${selectedExam?.id === exam.id ? "bg-indigo-50/60 border-l-2 border-indigo-600" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono font-bold text-indigo-700">
                        {courseById.get(exam.courseId)?.code ?? exam.courseId}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                        {exam.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {exam.examDate} · {displayTime(exam.startTime)}–{displayTime(exam.endTime)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                      {exam.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-5">
          {!selectedExam ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-500">
              Select an exam to manage it.
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono font-bold text-indigo-700">
                      {courseById.get(selectedExam.courseId)?.code ?? selectedExam.courseId} ·{" "}
                      {selectedExam.type}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">{selectedExam.title}</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedExam.description || "No description provided."}
                    </p>
                  </div>
                  <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                    {selectedExam.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Date</span>
                    <b className="text-slate-800">{selectedExam.examDate}</b>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Time</span>
                    <b className="text-slate-800">
                      {displayTime(selectedExam.startTime)}–{displayTime(selectedExam.endTime)}
                    </b>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total marks</span>
                    <b className="text-slate-800">{numberValue(selectedExam.totalMarks)}</b>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pass marks</span>
                    <b className="text-slate-800">{numberValue(selectedExam.passMarks)}</b>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={openEdit}
                    disabled={!canEdit || isSaving}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg disabled:opacity-40"
                  >
                    <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => void transition("schedule")}
                    disabled={!canSchedule || isSaving}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg disabled:opacity-40"
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => void transition("marking")}
                    disabled={!canStartMarking || isSaving}
                    className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg disabled:opacity-40"
                  >
                    Start marking
                  </button>
                  <button
                    onClick={() => void transition("complete")}
                    disabled={!canComplete || isSaving}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg disabled:opacity-40"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => void transition("cancel")}
                    disabled={!canCancel || isSaving}
                    className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Results and summary</h3>
                  {selectedExam.status === "MARKING" && (
                    <button
                      onClick={() => void saveMarks()}
                      disabled={isSaving || isResultsLoading}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5 inline mr-1" />
                      Save marks
                    </button>
                  )}
                </div>
                {isResultsLoading ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Loading result sheet...
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 border-b border-slate-100">
                      {[
                        ["Students", summary?.totalStudents ?? 0],
                        ["Present", summary?.presentStudents ?? 0],
                        ["Absent", summary?.absentStudents ?? 0],
                        ["Passed", summary?.passedStudents ?? 0],
                        ["Average", numberValue(summary?.averageMarks)],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-slate-50 p-2.5 text-center">
                          <span className="block text-[10px] text-slate-500">{label}</span>
                          <b className="text-sm text-slate-900">{value}</b>
                        </div>
                      ))}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-5 py-3">Student</th>
                            <th className="px-3 py-3">Attendance</th>
                            <th className="px-3 py-3">Marks</th>
                            <th className="px-3 py-3">Grade</th>
                            <th className="px-5 py-3">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {results.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                                No result records available.
                              </td>
                            </tr>
                          ) : (
                            results.map((result, index) => (
                              <tr key={result.studentId} className="hover:bg-slate-50/60">
                                <td className="px-5 py-3 font-semibold text-slate-900">
                                  Student {result.studentId.slice(0, 8)}
                                </td>
                                <td className="px-3 py-3">
                                  <select
                                    value={result.attendanceStatus}
                                    disabled={selectedExam.status !== "MARKING" || isSaving}
                                    onChange={(event) =>
                                      updateResult(index, {
                                        attendanceStatus: event.target
                                          .value as ExamAttendanceStatus,
                                      })
                                    }
                                    className="border border-slate-200 rounded px-2 py-1 text-[11px]"
                                  >
                                    <option value="PRESENT">Present</option>
                                    <option value="ABSENT">Absent</option>
                                    <option value="LATE">Late</option>
                                    <option value="NOT_MARKED">Not marked</option>
                                  </select>
                                </td>
                                <td className="px-3 py-3">
                                  <input
                                    type="number"
                                    min="0"
                                    max={Number(selectedExam.totalMarks)}
                                    step="0.01"
                                    value={result.marksObtained ?? ""}
                                    disabled={
                                      selectedExam.status !== "MARKING" ||
                                      result.attendanceStatus === "ABSENT" ||
                                      isSaving
                                    }
                                    onChange={(event) =>
                                      updateResult(index, {
                                        marksObtained:
                                          event.target.value === ""
                                            ? undefined
                                            : Number(event.target.value),
                                      })
                                    }
                                    className="w-20 border border-slate-200 rounded px-2 py-1 text-[11px]"
                                  />
                                </td>
                                <td className="px-3 py-3 font-semibold text-indigo-700">
                                  {result.grade ?? "—"}
                                </td>
                                <td className="px-5 py-3">
                                  <input
                                    value={result.remarks ?? ""}
                                    disabled={selectedExam.status !== "MARKING" || isSaving}
                                    onChange={(event) =>
                                      updateResult(index, { remarks: event.target.value })
                                    }
                                    className="w-full min-w-28 border border-slate-200 rounded px-2 py-1 text-[11px]"
                                    placeholder="Optional"
                                  />
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={saveExam}
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingExam ? "Edit exam draft" : "Create exam draft"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  The backend controls exam status and ownership.
                </p>
              </div>
              <button type="button" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-700">
                Course
                <select
                  required
                  disabled={Boolean(editingExam)}
                  value={form.courseId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, courseId: event.target.value }))
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select course</option>
                  {backendCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Type
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, type: event.target.value as ExamType }))
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="MIDTERM">Midterm</option>
                  <option value="FINAL">Final</option>
                  <option value="PRACTICAL">Practical</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
            </div>
            <label className="text-xs font-semibold text-slate-700">
              Title
              <input
                required
                maxLength={200}
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Description
              <textarea
                maxLength={2000}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="text-xs font-semibold text-slate-700">
                Date
                <input
                  required
                  type="date"
                  value={form.examDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, examDate: event.target.value }))
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Start
                <input
                  required
                  type="time"
                  value={form.startTime}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, startTime: event.target.value }))
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                End
                <input
                  required
                  type="time"
                  value={form.endTime}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, endTime: event.target.value }))
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Total marks
                <input
                  required
                  min="0.01"
                  type="number"
                  step="0.01"
                  value={form.totalMarks}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, totalMarks: Number(event.target.value) }))
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block text-xs font-semibold text-slate-700">
              Pass marks
              <input
                required
                min="0"
                max={form.totalMarks}
                type="number"
                step="0.01"
                value={form.passMarks}
                onChange={(event) =>
                  setForm((current) => ({ ...current, passMarks: Number(event.target.value) }))
                }
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <button
              disabled={isSaving}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSaving ? "Saving..." : editingExam ? "Save draft" : "Create draft"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle, ClipboardCheck, Loader2, Plus, Save, X } from "lucide-react";
import type { BackendCourse } from "../api/courseApi";
import {
  cancelAttendanceSession,
  completeAttendanceSession,
  createAttendanceSession,
  getAttendanceSession,
  getCourseAttendanceSessions,
  type AttendanceRecordMarkRequest,
  type BackendAttendanceRecord,
  type BackendAttendanceSession,
  updateAttendanceRecords,
} from "../api/attendanceApi";
import type { Course } from "../types";

type AttendanceWorkspaceViewProps = { courses: Course[]; backendCourses: BackendCourse[] };
type EditableRecord = BackendAttendanceRecord & { remarks: string };

function shortId(value: string) {
  return value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

function displayTime(value: string) {
  return value.length > 5 ? value.slice(0, 5) : value;
}

function toEditableRecords(records: BackendAttendanceRecord[] = []): EditableRecord[] {
  return records.map((record) => ({ ...record, remarks: record.remarks ?? "" }));
}

export const AttendanceWorkspaceView: React.FC<AttendanceWorkspaceViewProps> = ({
  courses,
  backendCourses,
}) => {
  const [sessions, setSessions] = useState<BackendAttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<BackendAttendanceSession | null>(null);
  const [records, setRecords] = useState<EditableRecord[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(backendCourses[0]?.id ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    courseId: backendCourses[0]?.id ?? "",
    title: "",
    attendanceDate: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "10:00",
  });

  const courseById = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );
  const selectedCourseSessions = sessions.filter(
    (session) => session.courseId === selectedCourseId,
  );
  const activeCourse = selectedSession ? courseById.get(selectedSession.courseId) : undefined;
  const isOpen = selectedSession?.status === "OPEN";
  const counts = useMemo(
    () => ({
      present: records.filter((record) => record.status === "PRESENT").length,
      late: records.filter((record) => record.status === "LATE").length,
      absent: records.filter((record) => record.status === "ABSENT").length,
      notMarked: records.filter((record) => record.status === "NOT_MARKED").length,
    }),
    [records],
  );

  async function loadSessions() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await Promise.all(
        backendCourses.map((course) => getCourseAttendanceSessions(course.id)),
      );
      const nextSessions = result.flat();
      setSessions(nextSessions);
      const first =
        nextSessions.find((session) => session.courseId === selectedCourseId) ?? nextSessions[0];
      if (first) await selectSession(first.id, nextSessions);
      else {
        setSelectedSession(null);
        setRecords([]);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Attendance sessions failed to load.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function selectSession(sessionId: string, availableSessions = sessions) {
    const summary = availableSessions.find((session) => session.id === sessionId);
    if (!summary) return;
    setIsDetailLoading(true);
    setError(null);
    try {
      const detail = await getAttendanceSession(sessionId);
      setSelectedSession(detail ?? summary);
      setRecords(toEditableRecords(detail?.records ?? summary.records));
      setSelectedCourseId(summary.courseId);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Attendance session failed to load.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  }

  useEffect(() => {
    if (backendCourses.length > 0) void loadSessions();
    else {
      setSessions([]);
      setSelectedSession(null);
      setRecords([]);
      setIsLoading(false);
    }
    // The teacher course list is the data dependency for this workspace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendCourses]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const created = await createAttendanceSession(createForm);
      if (created) {
        setSessions((current) => [created, ...current]);
        setShowCreate(false);
        setNotice("Attendance session created.");
        await selectSession(created.id, [created, ...sessions]);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Attendance session could not be created.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function setRecordStatus(recordId: string, status: EditableRecord["status"]) {
    setRecords((current) =>
      current.map((record) => (record.id === recordId ? { ...record, status } : record)),
    );
  }

  async function saveRecords() {
    if (!selectedSession || !isOpen) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateAttendanceRecords(
        selectedSession.id,
        records.map(
          ({ studentId, status, remarks }): AttendanceRecordMarkRequest => ({
            studentId,
            status,
            ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
          }),
        ),
      );
      if (updated) {
        setSelectedSession(updated);
        setRecords(toEditableRecords(updated.records));
        setSessions((current) =>
          current.map((session) => (session.id === updated.id ? updated : session)),
        );
      }
      setNotice("Attendance records saved.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Attendance records could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function transitionSession(transition: "complete" | "cancel") {
    if (!selectedSession || !isOpen) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated =
        transition === "complete"
          ? await completeAttendanceSession(selectedSession.id)
          : await cancelAttendanceSession(selectedSession.id);
      if (updated) {
        setSelectedSession(updated);
        setRecords(toEditableRecords(updated.records));
        setSessions((current) =>
          current.map((session) => (session.id === updated.id ? updated : session)),
        );
      }
      setNotice(
        transition === "complete"
          ? "Attendance session completed."
          : "Attendance session cancelled.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Attendance session transition failed.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Attendance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create sessions, conduct roll call, and finalize attendance.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> New session
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
          <button onClick={() => void loadSessions()} className="ml-3 underline">
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCourseId}
              onChange={(event) => {
                setSelectedCourseId(event.target.value);
                const next = sessions.find((session) => session.courseId === event.target.value);
                if (next) void selectSession(next.id);
              }}
              className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg"
            >
              <option value="">Select course</option>
              {backendCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName}
                </option>
              ))}
            </select>
            <select
              value={selectedSession?.id ?? ""}
              onChange={(event) => void selectSession(event.target.value)}
              className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg"
              disabled={!selectedCourseSessions.length}
            >
              <option value="">Select session</option>
              {selectedCourseSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.attendanceDate} · {session.title}
                </option>
              ))}
            </select>
          </div>
          {selectedSession && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => void transitionSession("cancel")}
                disabled={!isOpen || isSaving}
                className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5 inline mr-1" />
                Cancel
              </button>
              <button
                onClick={() => void transitionSession("complete")}
                disabled={!isOpen || isSaving}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 inline mr-1" />
                Complete
              </button>
            </div>
          )}
        </div>

        {isLoading || isDetailLoading ? (
          <div className="py-10 text-center text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            Loading attendance...
          </div>
        ) : !selectedSession ? (
          <div className="py-10 text-center text-xs text-slate-500">
            No attendance sessions found. Create a new session to begin.
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {activeCourse?.code ?? selectedSession.courseId}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {selectedSession.status}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {selectedSession.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedSession.attendanceDate} · {displayTime(selectedSession.startTime)} -{" "}
                  {displayTime(selectedSession.endTime)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setRecords((current) =>
                      current.map((record) => ({ ...record, status: "PRESENT" })),
                    )
                  }
                  disabled={!isOpen || isSaving}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 inline mr-1" />
                  Mark all present
                </button>
                <button
                  onClick={() => void saveRecords()}
                  disabled={!isOpen || isSaving}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 inline mr-1" />
                  {isSaving ? "Saving..." : "Save records"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800">Present</span>
                <div className="text-xl font-bold text-emerald-700">{counts.present}</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800">Late</span>
                <div className="text-xl font-bold text-amber-700">{counts.late}</div>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-center">
                <span className="text-[10px] uppercase font-bold text-rose-800">Absent</span>
                <div className="text-xl font-bold text-rose-700">{counts.absent}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-600">Not marked</span>
                <div className="text-xl font-bold text-slate-800">{counts.notMarked}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedSession && !isDetailLoading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Class roster attendance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-4 py-3">Marked at</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      Student {shortId(record.studentId)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {record.markedAt ? new Date(record.markedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <input
                        value={record.remarks}
                        onChange={(event) =>
                          setRecords((current) =>
                            current.map((item) =>
                              item.id === record.id
                                ? { ...item, remarks: event.target.value }
                                : item,
                            ),
                          )
                        }
                        disabled={!isOpen || isSaving}
                        placeholder="Optional remarks"
                        className="w-full min-w-32 border border-slate-200 rounded px-2 py-1 text-xs disabled:bg-slate-50"
                      />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex p-1 bg-slate-100 rounded-lg gap-1">
                        {(["PRESENT", "LATE", "ABSENT", "NOT_MARKED"] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => setRecordStatus(record.id, status)}
                            disabled={!isOpen || isSaving}
                            className={`px-2 py-1 text-[10px] rounded-md disabled:opacity-50 ${record.status === status ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"}`}
                          >
                            {status.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Create attendance session</h2>
              <button type="button" onClick={() => setShowCreate(false)}>
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <label className="block text-xs font-semibold text-slate-700">
              Course
              <select
                required
                value={createForm.courseId}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, courseId: event.target.value }))
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
            <label className="block text-xs font-semibold text-slate-700">
              Session title
              <input
                required
                maxLength={150}
                value={createForm.title}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, title: event.target.value }))
                }
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="block text-xs font-semibold text-slate-700 col-span-3 sm:col-span-1">
                Date
                <input
                  required
                  type="date"
                  value={createForm.attendanceDate}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, attendanceDate: event.target.value }))
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Start
                <input
                  required
                  type="time"
                  value={createForm.startTime}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, startTime: event.target.value }))
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                End
                <input
                  required
                  type="time"
                  value={createForm.endTime}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, endTime: event.target.value }))
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm"
                />
              </label>
            </div>
            <button
              disabled={isSaving}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSaving ? "Creating..." : "Create session"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

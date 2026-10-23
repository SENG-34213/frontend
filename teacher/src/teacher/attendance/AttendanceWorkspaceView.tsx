"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  ClipboardCheck,
  CalendarDays,
  Loader2,
  Plus,
  Search,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { BackendCourse } from "../api/courseApi";
import {
  cancelAttendanceSession,
  completeAttendanceSession,
  createAttendanceSession,
  deleteAttendanceSession,
  getAttendanceSession,
  getCourseAttendanceSessions,
  type AttendanceRecordMarkRequest,
  type BackendAttendanceRecord,
  type BackendAttendanceSession,
  updateAttendanceRecords,
} from "../api/attendanceApi";
import type { Course } from "../types";
import type { Student } from "../types";

type AttendanceWorkspaceViewProps = {
  courses: Course[];
  backendCourses: BackendCourse[];
  students: Student[];
};
type EditableRecord = BackendAttendanceRecord & { remarks: string };

function displayTime(value: string) {
  return value.length > 5 ? value.slice(0, 5) : value;
}

function toEditableRecords(records: BackendAttendanceRecord[] = []): EditableRecord[] {
  return records.map((record) => ({ ...record, remarks: record.remarks ?? "" }));
}

export const AttendanceWorkspaceView: React.FC<AttendanceWorkspaceViewProps> = ({
  courses,
  backendCourses,
  students,
}) => {
  const [sessions, setSessions] = useState<BackendAttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<BackendAttendanceSession | null>(null);
  const [records, setRecords] = useState<EditableRecord[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(backendCourses[0]?.id ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<
    "ALL" | BackendAttendanceSession["status"]
  >("ALL");
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
  const studentNameById = useMemo(
    () => new Map(students.map((student) => [student.id, student.name])),
    [students],
  );
  const selectedCourseSessions = sessions.filter(
    (session) => session.courseId === selectedCourseId,
  );
  const visibleSessions = selectedCourseSessions.filter((session) => {
    const query = sessionSearch.trim().toLowerCase();
    const matchesStatus = sessionStatusFilter === "ALL" || session.status === sessionStatusFilter;
    return (
      matchesStatus &&
      (!query ||
        session.title.toLowerCase().includes(query) ||
        session.attendanceDate.includes(query))
    );
  });
  const openSessionCount = sessions.filter((session) => session.status === "OPEN").length;
  const completedSessionCount = sessions.filter((session) => session.status === "COMPLETED").length;
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

  async function loadSessions(signal?: AbortSignal) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await Promise.all(
        backendCourses.map((course) => getCourseAttendanceSessions(course.id, signal)),
      );
      if (signal?.aborted) return;
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
      if (!signal?.aborted) setIsLoading(false);
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
    const controller = new AbortController();
    if (backendCourses.length > 0) void loadSessions(controller.signal);
    else {
      setSessions([]);
      setSelectedSession(null);
      setRecords([]);
      setIsLoading(false);
    }
    return () => controller.abort();
    // The teacher course list is the data dependency for this workspace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendCourses]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setCreateError(null);
    if (createForm.startTime >= createForm.endTime) {
      setCreateError("Start time must be before end time.");
      setIsSaving(false);
      return;
    }
    try {
      const created = await createAttendanceSession(createForm);
      if (created) {
        setSessions((current) => [created, ...current]);
        setShowCreate(false);
        setNotice("Attendance session created.");
        await selectSession(created.id, [created, ...sessions]);
      }
    } catch (requestError) {
      setCreateError(
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

  async function handleDeleteSession() {
    if (!selectedSession || selectedSession.status === "COMPLETED") return;
    setIsSaving(true);
    setError(null);
    try {
      await deleteAttendanceSession(selectedSession.id);
      const deletedId = selectedSession.id;
      const remaining = sessions.filter((session) => session.id !== deletedId);
      const nextSession = remaining.find((session) => session.courseId === selectedCourseId);
      setSessions(remaining);
      setShowDeleteConfirm(false);
      setSelectedSession(null);
      setRecords([]);
      setNotice("Attendance session deleted. You can create a new session now.");
      if (nextSession) await selectSession(nextSession.id, remaining);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Attendance session could not be deleted.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-[1500px] space-y-6 pb-12">
        <section className="overflow-hidden rounded-[28px] bg-[#111827] px-6 py-7 text-white shadow-xl shadow-slate-300/20 sm:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                <ClipboardCheck className="h-4 w-4" /> Teaching operations
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Attendance control center
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Start a session, take roll call, and keep every class record organized in one
                focused workspace.
              </p>
            </div>
            <button
              onClick={() => {
                setCreateError(null);
                setShowCreate(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              <Plus className="h-4 w-4" /> New session
            </button>
          </div>
          <div className="mt-7 grid max-w-2xl grid-cols-3 gap-2">
            {[
              ["All sessions", sessions.length, "text-white"],
              ["Open now", openSessionCount, "text-cyan-300"],
              ["Completed", completedSessionCount, "text-emerald-300"],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
                <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
              </div>
            ))}
          </div>
        </section>

        {notice && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
            <CheckCircle className="h-4 w-4" /> {notice}
          </div>
        )}
        {error && !showCreate && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
            <span>{error}</span>
            <button onClick={() => void loadSessions()} className="underline">
              Retry
            </button>
          </div>
        )}

        <section className="grid min-h-[620px] grid-cols-1 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 bg-slate-50/70 xl:border-b-0 xl:border-r">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                    Sessions
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">Your classes</h2>
                </div>
                <CalendarDays className="h-5 w-5 text-slate-400" />
              </div>
              <select
                value={selectedCourseId}
                onChange={(event) => {
                  setSelectedCourseId(event.target.value);
                  const next = sessions.find((session) => session.courseId === event.target.value);
                  if (next) void selectSession(next.id);
                  else {
                    setSelectedSession(null);
                    setRecords([]);
                  }
                }}
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select course</option>
                {backendCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseName}
                  </option>
                ))}
              </select>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={sessionSearch}
                  onChange={(event) => setSessionSearch(event.target.value)}
                  placeholder="Search sessions"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="mt-3 flex gap-1.5 overflow-x-auto">
                {(["ALL", "OPEN", "COMPLETED", "CANCELLED"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSessionStatusFilter(status)}
                    className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-[10px] font-bold ${sessionStatusFilter === status ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-100"}`}
                  >
                    {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[530px] space-y-2 overflow-y-auto p-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-xs text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading sessions
                </div>
              ) : visibleSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
                  <CalendarDays className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-3 text-xs font-semibold text-slate-700">No matching sessions</p>
                  <p className="mt-1 text-[11px] text-slate-400">Create a new session to begin.</p>
                </div>
              ) : (
                visibleSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => void selectSession(session.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${selectedSession?.id === session.id ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-transparent bg-white hover:border-slate-200 hover:shadow-sm"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-xs font-bold text-slate-900">{session.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${session.status === "OPEN" ? "bg-cyan-100 text-cyan-700" : session.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                      >
                        {session.status.charAt(0) + session.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-slate-500">
                      {session.attendanceDate}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {displayTime(session.startTime)} – {displayTime(session.endTime)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>

          <div className="min-w-0 bg-white">
            {isDetailLoading ? (
              <div className="flex min-h-[620px] items-center justify-center text-xs text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading session
              </div>
            ) : !selectedSession ? (
              <div className="flex min-h-[620px] flex-col items-center justify-center px-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                  <ClipboardCheck className="h-8 w-8" />
                </span>
                <h2 className="mt-5 text-xl font-bold text-slate-900">Choose a session to begin</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Select a session from the list or create a new one for your next class.
                </p>
                <button
                  onClick={() => {
                    setCreateError(null);
                    setShowCreate(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" /> Create session
                </button>
              </div>
            ) : (
              <div className="p-5 sm:p-7">
                <div className="flex flex-col justify-between gap-5 border-b border-slate-100 pb-6 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                        {activeCourse?.code ?? "Course"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isOpen ? "bg-cyan-100 text-cyan-700" : selectedSession.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {selectedSession.status}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                      {selectedSession.title}
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays className="h-4 w-4 text-indigo-500" />{" "}
                      {selectedSession.attendanceDate} · {displayTime(selectedSession.startTime)} –{" "}
                      {displayTime(selectedSession.endTime)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={selectedSession.status === "COMPLETED" || isSaving}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                    >
                      <Trash2 className="mr-1.5 inline h-3.5 w-3.5" /> Delete
                    </button>
                    <button
                      onClick={() => void transitionSession("cancel")}
                      disabled={!isOpen || isSaving}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => void transitionSession("complete")}
                      disabled={!isOpen || isSaving}
                      className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Check className="mr-1.5 inline h-3.5 w-3.5" /> Complete
                    </button>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Present", counts.present, "text-emerald-600", "bg-emerald-50"],
                    ["Late", counts.late, "text-amber-600", "bg-amber-50"],
                    ["Absent", counts.absent, "text-rose-600", "bg-rose-50"],
                    ["Not marked", counts.notMarked, "text-slate-700", "bg-slate-100"],
                  ].map(([label, value, text, bg]) => (
                    <div key={label} className={`rounded-2xl ${bg} p-4`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {label}
                      </p>
                      <p className={`mt-1 text-2xl font-bold ${text}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-7 flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Class roster</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Mark each student and add a note when needed.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setRecords((current) =>
                          current.map((record) => ({ ...record, status: "PRESENT" })),
                        )
                      }
                      disabled={!isOpen || isSaving}
                      className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 disabled:opacity-50"
                    >
                      <Check className="mr-1 inline h-3.5 w-3.5" /> Mark all present
                    </button>
                    <button
                      onClick={() => void saveRecords()}
                      disabled={!isOpen || isSaving}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      <Save className="mr-1 inline h-3.5 w-3.5" />{" "}
                      {isSaving ? "Saving…" : "Save records"}
                    </button>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[700px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Marked at</th>
                        <th className="px-4 py-3">Remarks</th>
                        <th className="px-4 py-3 text-right">Attendance status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3.5 font-semibold text-slate-900">
                            <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                              <Users className="h-3.5 w-3.5" />
                            </span>
                            {record.studentName?.trim() ||
                              studentNameById.get(record.studentId) ||
                              "Student name unavailable"}
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
                              placeholder="Add note"
                              className="w-full min-w-32 rounded-lg border border-slate-200 px-2.5 py-2 text-xs disabled:bg-slate-50"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1">
                              {(["PRESENT", "LATE", "ABSENT", "NOT_MARKED"] as const).map(
                                (status) => (
                                  <button
                                    key={status}
                                    onClick={() => setRecordStatus(record.id, status)}
                                    disabled={!isOpen || isSaving}
                                    className={`rounded-lg px-2 py-1.5 text-[10px] font-semibold disabled:opacity-50 ${record.status === status ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-900"}`}
                                  >
                                    {status === "NOT_MARKED"
                                      ? "Unmarked"
                                      : status.charAt(0) + status.slice(1).toLowerCase()}
                                  </button>
                                ),
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="hidden">
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
            onClick={() => {
              setCreateError(null);
              setShowCreate(true);
            }}
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
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={selectedSession.status === "COMPLETED" || isSaving}
                  title={
                    selectedSession.status === "COMPLETED"
                      ? "Completed sessions cannot be deleted"
                      : "Delete attendance session"
                  }
                  className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  Delete
                </button>
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
                        Student name unavailable
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
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={handleCreate}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-attendance-title"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 id="create-attendance-title" className="text-base font-bold text-slate-900">
                Create attendance session
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => {
                  setShowCreate(false);
                  setCreateError(null);
                }}
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            {createError && (
              <div
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-800"
              >
                {createError}
              </div>
            )}
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
                  onChange={(event) => {
                    setCreateError(null);
                    setCreateForm((current) => ({ ...current, startTime: event.target.value }));
                  }}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                End
                <input
                  required
                  type="time"
                  value={createForm.endTime}
                  onChange={(event) => {
                    setCreateError(null);
                    setCreateForm((current) => ({ ...current, endTime: event.target.value }));
                  }}
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

      {showDeleteConfirm && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-attendance-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 id="delete-attendance-title" className="text-base font-bold text-slate-900">
                  Delete attendance session?
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  “{selectedSession.title}” will be removed from this course. This action cannot be
                  undone, but completed attendance sessions are protected.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSaving}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Keep session
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteSession()}
                disabled={isSaving}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isSaving ? "Deleting…" : "Delete session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  ClipboardCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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
import { TeacherAvatar } from "../components/TeacherAvatar";

type AttendanceWorkspaceViewProps = {
  courses: Course[];
  backendCourses: BackendCourse[];
  students: Student[];
};
type EditableRecord = BackendAttendanceRecord & { remarks: string };

const ATTENDANCE_STATUS_STYLES = {
  PRESENT: {
    label: "Present",
    dot: "bg-emerald-500",
    active: "border-emerald-200 bg-emerald-100 ring-2 ring-emerald-500/20",
    inactive: "text-slate-600 hover:bg-emerald-50",
  },
  LATE: {
    label: "Late",
    dot: "bg-amber-500",
    active: "border-amber-200 bg-amber-100 ring-2 ring-amber-500/20",
    inactive: "text-slate-600 hover:bg-amber-50",
  },
  ABSENT: {
    label: "Absent",
    dot: "bg-rose-500",
    active: "border-rose-200 bg-rose-100 ring-2 ring-rose-500/20",
    inactive: "text-slate-600 hover:bg-rose-50",
  },
  NOT_MARKED: {
    label: "Unmarked",
    dot: "bg-slate-400",
    active: "border-slate-300 bg-slate-100 ring-2 ring-slate-400/20",
    inactive: "text-slate-600 hover:bg-slate-100",
  },
} as const;

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
  const [sessionDateFilter, setSessionDateFilter] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [sessionPage, setSessionPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
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
  const studentById = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((student) => {
      map.set(student.id, student);
      map.set(student.studentId, student);
    });
    return map;
  }, [students]);
  const selectedCourseSessions = sessions.filter(
    (session) => session.courseId === selectedCourseId,
  );
  const visibleSessions = selectedCourseSessions.filter((session) => {
    const query = sessionSearch.trim().toLowerCase();
    const matchesStatus = sessionStatusFilter === "ALL" || session.status === sessionStatusFilter;
    return (
      matchesStatus &&
      (!sessionDateFilter || session.attendanceDate === sessionDateFilter) &&
      (!query ||
        session.title.toLowerCase().includes(query) ||
        session.attendanceDate.includes(query))
    );
  });
  const sessionsPerPage = 9;
  const sessionPageCount = Math.max(1, Math.ceil(visibleSessions.length / sessionsPerPage));
  const paginatedSessions = visibleSessions.slice(
    (sessionPage - 1) * sessionsPerPage,
    sessionPage * sessionsPerPage,
  );
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
  const selectedStudentHistory = useMemo(() => {
    if (!selectedStudentId) return [];
    const history = selectedCourseSessions.flatMap((session) =>
      (session.records ?? [])
        .filter((record) => record.studentId === selectedStudentId)
        .map((record) => ({ session, record })),
    );
    if (selectedSession) {
      const currentRecord = records.find((record) => record.studentId === selectedStudentId);
      if (currentRecord && !history.some(({ session }) => session.id === selectedSession.id)) {
        history.push({ session: selectedSession, record: currentRecord });
      }
    }
    return history.sort((a, b) => b.session.attendanceDate.localeCompare(a.session.attendanceDate));
  }, [records, selectedCourseSessions, selectedSession, selectedStudentId]);
  const selectedStudentName =
    selectedStudentHistory[0]?.record.studentName?.trim() ||
    studentNameById.get(selectedStudentId ?? "") ||
    "Student attendance record";
  const selectedStudentProfile = studentById.get(selectedStudentId ?? "");
  const studentMarkedCount = selectedStudentHistory.filter(
    ({ record }) => record.status !== "NOT_MARKED",
  ).length;
  const studentPresentCount = selectedStudentHistory.filter(
    ({ record }) => record.status === "PRESENT",
  ).length;
  const studentAbsentCount = selectedStudentHistory.filter(
    ({ record }) => record.status === "ABSENT",
  ).length;
  const studentAttendanceRate = studentMarkedCount
    ? Math.round((studentPresentCount / studentMarkedCount) * 100)
    : 0;
  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: Math.ceil((startOffset + daysInMonth) / 7) * 7 }, (_, index) => {
      const day = index - startOffset + 1;
      return day > 0 && day <= daysInMonth ? new Date(year, month, day) : null;
    });
  }, [calendarMonth]);
  const calendarSessionDates = useMemo(
    () => new Set(selectedCourseSessions.map((session) => session.attendanceDate)),
    [selectedCourseSessions],
  );

  useEffect(() => {
    setSessionPage(1);
  }, [selectedCourseId, sessionSearch, sessionStatusFilter, sessionDateFilter]);

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
      <div className="mx-auto max-w-[1500px] space-y-5 pb-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-indigo-600">
              Home <span className="px-1 text-slate-300">›</span> Attendance
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Attendance Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Record and review attendance for your classes.
            </p>
          </div>
          <button
            onClick={() => {
              setCreateError(null);
              setShowCreate(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Take attendance
          </button>
        </div>

        {notice && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
            <CheckCircle className="h-4 w-4" /> {notice}
          </div>
        )}
        {error && !showCreate && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
            <span>{error}</span>
            <button onClick={() => void loadSessions()} className="underline">
              Retry
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto] xl:items-end">
              <label className="text-xs font-semibold text-slate-700">
                Course
                <select
                  value={selectedCourseId}
                  onChange={(event) => {
                    setSelectedCourseId(event.target.value);
                    const next = sessions.find(
                      (session) => session.courseId === event.target.value,
                    );
                    if (next) void selectSession(next.id);
                    else {
                      setSelectedSession(null);
                      setRecords([]);
                    }
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
                Attendance session
                <select
                  value={selectedSession?.id ?? ""}
                  onChange={(event) => void selectSession(event.target.value)}
                  disabled={!selectedCourseSessions.length}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none disabled:bg-slate-50"
                >
                  <option value="">Select session</option>
                  {selectedCourseSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.attendanceDate} · {session.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Date
                <input
                  type="date"
                  value={sessionDateFilter}
                  onChange={(event) => setSessionDateFilter(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Search sessions
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={sessionSearch}
                    onChange={(event) => setSessionSearch(event.target.value)}
                    placeholder="Search by title or date"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </label>
              <button
                onClick={() => {
                  setSessionSearch("");
                  setSessionDateFilter("");
                  setSessionStatusFilter("ALL");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </span>
              {(["ALL", "OPEN", "COMPLETED", "CANCELLED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSessionStatusFilter(status)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${sessionStatusFilter === status ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50/50 px-4 py-4 sm:px-5">
            <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() =>
                      setCalendarMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                      )
                    }
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h2 className="text-xs font-bold text-slate-900">
                    {calendarMonth.toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() =>
                      setCalendarMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                      )
                    }
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 text-center text-[9px] font-bold uppercase text-slate-400">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                    <span key={`${day}-${index}`} className="py-1">
                      {day}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarCells.map((date, index) => {
                    if (!date) return <span key={`empty-${index}`} className="h-8" />;
                    const dateKey = date.toISOString().slice(0, 10);
                    const isSelected = sessionDateFilter === dateKey;
                    const hasSession = calendarSessionDates.has(dateKey);
                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => setSessionDateFilter(isSelected ? "" : dateKey)}
                        className={`relative h-8 rounded-lg text-[10px] font-semibold transition ${isSelected ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}
                      >
                        <span>{date.getDate()}</span>
                        {hasSession && (
                          <span
                            className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${isSelected ? "bg-white" : "bg-indigo-500"}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSessionDateFilter("");
                    setCalendarMonth(new Date());
                  }}
                  className="mt-3 w-full rounded-lg border border-slate-200 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Show all dates
                </button>
              </div>
              <div className="min-w-0">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Daily attendance</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Select a day to open its student attendance details.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 shadow-sm">
                    {visibleSessions.length} {visibleSessions.length === 1 ? "session" : "sessions"}
                  </span>
                </div>
                {visibleSessions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-xs text-slate-500">
                    No attendance days match the selected filters.
                  </div>
                ) : (
                  <>
                    <div className="grid max-h-[430px] gap-2 overflow-y-auto md:grid-cols-3">
                      {paginatedSessions.map((session) => (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => void selectSession(session.id)}
                          className={`flex items-center justify-between gap-3 rounded-xl border bg-white p-3 text-left transition ${selectedSession?.id === session.id ? "border-indigo-300 bg-indigo-50/70 shadow-sm" : "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30"}`}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                              <span className="text-[9px] font-bold uppercase">
                                {new Date(`${session.attendanceDate}T00:00:00`).toLocaleDateString(
                                  undefined,
                                  { month: "short" },
                                )}
                              </span>
                              <span className="text-sm font-bold leading-none">
                                {new Date(`${session.attendanceDate}T00:00:00`).getDate()}
                              </span>
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-bold text-slate-900">
                                {session.title}
                              </span>
                              <span className="mt-1 block text-[10px] text-slate-500">
                                {displayTime(session.startTime)} – {displayTime(session.endTime)}
                              </span>
                            </span>
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${session.status === "OPEN" ? "bg-indigo-100 text-indigo-700" : session.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            {session.status.charAt(0) + session.status.slice(1).toLowerCase()}
                          </span>
                        </button>
                      ))}
                    </div>
                    {sessionPageCount > 1 && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          Showing {(sessionPage - 1) * sessionsPerPage + 1}–
                          {Math.min(sessionPage * sessionsPerPage, visibleSessions.length)} of{" "}
                          {visibleSessions.length} days
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={sessionPage === 1}
                            onClick={() => setSessionPage((page) => Math.max(1, page - 1))}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 disabled:opacity-40"
                          >
                            Previous
                          </button>
                          {Array.from({ length: sessionPageCount }, (_, index) => index + 1).map(
                            (page) => (
                              <button
                                type="button"
                                key={page}
                                onClick={() => setSessionPage(page)}
                                className={`h-7 min-w-7 rounded-lg px-2 text-[10px] font-bold ${sessionPage === page ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                              >
                                {page}
                              </button>
                            ),
                          )}
                          <button
                            type="button"
                            disabled={sessionPage === sessionPageCount}
                            onClick={() =>
                              setSessionPage((page) => Math.min(sessionPageCount, page + 1))
                            }
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 disabled:opacity-40"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {isLoading || isDetailLoading ? (
            <div className="flex min-h-[360px] items-center justify-center text-xs text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading attendance
            </div>
          ) : !selectedSession ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ClipboardCheck className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No attendance session selected
              </h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Choose a course and session above, or create a new attendance session.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                      {activeCourse?.code ?? "Course"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isOpen ? "bg-indigo-100 text-indigo-700" : selectedSession.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {selectedSession.status}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-slate-900">{selectedSession.title}</h2>
                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays className="h-4 w-4 text-indigo-500" />{" "}
                    {selectedSession.attendanceDate} · {displayTime(selectedSession.startTime)} –{" "}
                    {displayTime(selectedSession.endTime)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={selectedSession.status === "COMPLETED" || isSaving}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                  >
                    <Trash2 className="mr-1 inline h-3.5 w-3.5" /> Delete
                  </button>
                  <button
                    onClick={() => void transitionSession("cancel")}
                    disabled={!isOpen || isSaving}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void transitionSession("complete")}
                    disabled={!isOpen || isSaving}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Check className="mr-1 inline h-3.5 w-3.5" /> Complete
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b border-slate-200 p-4 sm:grid-cols-4 sm:p-5">
                {[
                  {
                    label: "Present",
                    value: counts.present,
                    bg: "bg-emerald-50",
                    color: "text-emerald-600",
                  },
                  {
                    label: "Absent",
                    value: counts.absent,
                    bg: "bg-rose-50",
                    color: "text-rose-600",
                  },
                  { label: "Late", value: counts.late, bg: "bg-amber-50", color: "text-amber-600" },
                  {
                    label: "Not marked",
                    value: counts.notMarked,
                    bg: "bg-slate-100",
                    color: "text-slate-600",
                  },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl ${item.bg} p-3`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {item.label}
                    </p>
                    <p className={`mt-1 text-2xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student attendance</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Mark Present, Absent, or Late and add an optional remark.
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
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50"
                  >
                    <Check className="mr-1 inline h-3.5 w-3.5" /> Mark all present
                  </button>
                  <button
                    onClick={() => void saveRecords()}
                    disabled={!isOpen || isSaving}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    <Save className="mr-1 inline h-3.5 w-3.5" />{" "}
                    {isSaving ? "Saving…" : "Save records"}
                  </button>
                </div>
              </div>
              {records.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  No student attendance records found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[940px] text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="w-12 px-5 py-3">#</th>
                        <th className="px-4 py-3">Student name</th>
                        <th className="px-4 py-3">Student ID</th>
                        <th className="px-4 py-3">Attendance status</th>
                        <th className="px-4 py-3">Remarks</th>
                        <th className="px-5 py-3">Marked at</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.map((record, index) => (
                        <tr
                          key={record.id}
                          onClick={() => setSelectedStudentId(record.studentId)}
                          className="cursor-pointer hover:bg-indigo-50/30"
                        >
                          <td className="px-5 py-3.5 text-slate-500">{index + 1}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                                {(
                                  record.studentName?.trim() ||
                                  studentNameById.get(record.studentId) ||
                                  "S"
                                )
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </span>
                              <span className="font-semibold text-slate-900">
                                {record.studentName?.trim() ||
                                  studentNameById.get(record.studentId) ||
                                  "Student name unavailable"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-500">
                            {record.studentId}
                          </td>
                          <td className="px-4 py-3.5">
                            <div
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
                            >
                              {(["PRESENT", "ABSENT", "LATE"] as const).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => setRecordStatus(record.id, status)}
                                  disabled={!isOpen || isSaving}
                                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-semibold transition disabled:opacity-50 ${record.status === status ? ATTENDANCE_STATUS_STYLES[status].active : `border-transparent ${ATTENDANCE_STATUS_STYLES[status].inactive}`}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${ATTENDANCE_STATUS_STYLES[status].dot}`}
                                  />
                                  {ATTENDANCE_STATUS_STYLES[status].label}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <input
                              onClick={(event) => event.stopPropagation()}
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
                              placeholder="Add remark…"
                              className="w-full min-w-36 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-400 disabled:bg-slate-50"
                            />
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">
                            {record.markedAt ? new Date(record.markedAt).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        {selectedSession && counts.present + counts.absent + counts.late > 0 && (
          <section className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Attendance distribution</h3>
              <p className="mt-1 text-xs text-slate-500">Current session composition</p>
              <div className="mt-5 flex items-center justify-center">
                <div
                  className="relative h-40 w-40 rounded-full"
                  style={{
                    background: `conic-gradient(#4f46e5 0 ${(counts.present / (counts.present + counts.absent + counts.late)) * 100}%, #f43f5e ${(counts.present / (counts.present + counts.absent + counts.late)) * 100}% ${((counts.present + counts.absent) / (counts.present + counts.absent + counts.late)) * 100}%, #f59e0b ${((counts.present + counts.absent) / (counts.present + counts.absent + counts.late)) * 100}% 100%)`,
                  }}
                >
                  <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-2xl font-bold text-slate-900">
                      {counts.present + counts.absent + counts.late}
                    </span>
                    <span className="text-[10px] text-slate-500">total marked</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Session overview</h3>
              <p className="mt-1 text-xs text-slate-500">
                {selectedSession.title} · {selectedSession.attendanceDate}
              </p>
              <div className="mt-5 space-y-4">
                {[
                  {
                    label: "Present",
                    value: counts.present,
                    color: "bg-indigo-600",
                    total: counts.present + counts.absent + counts.late,
                  },
                  {
                    label: "Absent",
                    value: counts.absent,
                    color: "bg-rose-500",
                    total: counts.present + counts.absent + counts.late,
                  },
                  {
                    label: "Late",
                    value: counts.late,
                    color: "bg-amber-500",
                    total: counts.present + counts.absent + counts.late,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <span className="text-slate-500">
                        {item.value} ({Math.round((item.value / item.total) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${(item.value / item.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {selectedStudentId && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 p-4"
            onClick={() => setSelectedStudentId(null)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-attendance-title"
              onClick={(event) => event.stopPropagation()}
              className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between border-b border-slate-200 p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <TeacherAvatar
                    name={selectedStudentName}
                    avatarUrl={selectedStudentProfile?.avatar}
                    className="h-14 w-14"
                    initialsClassName="text-base"
                  />
                  <div>
                    <p className="text-xs font-semibold text-indigo-600">
                      Home <span className="px-1 text-slate-300">›</span> Students{" "}
                      <span className="px-1 text-slate-300">›</span> Attendance record
                    </p>
                    <h2
                      id="student-attendance-title"
                      className="mt-2 text-2xl font-bold text-slate-950"
                    >
                      {selectedStudentName}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedStudentId} · {activeCourse?.code ?? "Selected course"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close student attendance record"
                  onClick={() => setSelectedStudentId(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b border-slate-200 p-5 sm:grid-cols-4">
                <div className="rounded-xl bg-indigo-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Attendance rate
                  </p>
                  <p className="mt-1 text-2xl font-bold text-indigo-600">
                    {studentAttendanceRate}%
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Classes attended
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">{studentPresentCount}</p>
                </div>
                <div className="rounded-xl bg-rose-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Classes missed
                  </p>
                  <p className="mt-1 text-2xl font-bold text-rose-600">{studentAbsentCount}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Total sessions
                  </p>
                  <p className="mt-1 text-2xl font-bold text-amber-600">
                    {selectedStudentHistory.length}
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Attendance record</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Date-wise attendance history for this course.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">
                    {selectedStudentHistory.length} records
                  </span>
                </div>
                {selectedStudentHistory.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    No attendance history is available for this student yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[700px] text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Session</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Remark</th>
                          <th className="px-4 py-3">Marked at</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedStudentHistory.map(({ session, record }) => (
                          <tr key={`${session.id}-${record.id}`}>
                            <td className="px-4 py-3 font-medium text-slate-700">
                              {session.attendanceDate}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {session.title}
                              <span className="mt-1 block text-[10px] text-slate-400">
                                {displayTime(session.startTime)} – {displayTime(session.endTime)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${record.status === "PRESENT" ? "bg-emerald-100 text-emerald-700" : record.status === "ABSENT" ? "bg-rose-100 text-rose-700" : record.status === "LATE" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${ATTENDANCE_STATUS_STYLES[record.status].dot}`}
                                />
                                {ATTENDANCE_STATUS_STYLES[record.status].label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{record.remarks || "—"}</td>
                            <td className="px-4 py-3 text-slate-500">
                              {record.markedAt ? new Date(record.markedAt).toLocaleString() : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
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
                              className={`rounded-md border px-2 py-1 text-[10px] font-semibold transition disabled:opacity-50 ${record.status === status ? ATTENDANCE_STATUS_STYLES[status].active : `border-transparent ${ATTENDANCE_STATUS_STYLES[status].inactive}`}`}
                            >
                              {ATTENDANCE_STATUS_STYLES[status].label}
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
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-xl bg-white p-6 shadow-2xl space-y-4"
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

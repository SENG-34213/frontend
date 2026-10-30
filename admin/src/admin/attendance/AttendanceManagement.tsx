import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  GraduationCap,
  Save,
  Search,
  X,
  Users,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../../../../shared/ui/EmptyState";
import { AttendanceRecord, AttendanceSession, Course, Grade } from "../types";
import { updateAttendanceRecords } from "../api/attendanceApi";

interface AttendanceManagementProps {
  sessions: AttendanceSession[];
  courses: Course[];
  grades: Grade[];
  error?: string;
  selectedSessionId?: string | null;
  onSessionChange?: (sessionId: string | null) => void;
  onAttendanceSaved?: (session: AttendanceSession) => void;
}

function normalizedGrade(value?: string) {
  const normalized = (value || "")
    .trim()
    .toLowerCase()
    .replace(/^grade\s*/i, "");
  return /^\d+$/.test(normalized) ? normalized.padStart(2, "0") : normalized;
}

function percentage(value: number) {
  return Number.isFinite(value) ? `${Math.round(value)}%` : "0%";
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  sessions,
  courses,
  grades,
  error,
  selectedSessionId,
  onSessionChange,
  onAttendanceSaved,
}) => {
  const [selectedGradeId, setSelectedGradeId] = useState("ALL");
  const [selectedCourseId, setSelectedCourseId] = useState("ALL");
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [draftRecords, setDraftRecords] = useState<
    Record<string, { status: AttendanceSession["records"][number]["status"]; remarks: string }>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!selectedSessionId) {
      // The selected record is externalized in the URL; clear the local modal when that URL segment is removed.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSession(null);
      return;
    }
    const session = sessions.find((item) => item.id === selectedSessionId);
    if (session) {
      // Restore the modal from a deep-linked attendance URL after session data arrives.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSession(session);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStudentSearch("");
      setDraftRecords(
        Object.fromEntries(
          session.records.map((record) => [
            record.id,
            { status: record.status, remarks: record.remarks || "" },
          ]),
        ),
      );
      setSaveError("");
    }
  }, [selectedSessionId, sessions]);

  const saveAttendance = async () => {
    if (!selectedSession || isSaving) return;
    const records = selectedSession.records
      .map((record) => ({
        studentId: record.studentId,
        status: draftRecords[record.id]?.status || record.status,
        remarks: draftRecords[record.id]?.remarks ?? record.remarks ?? "",
      }))
      .filter(
        (
          record,
        ): record is {
          studentId: string;
          status: "PRESENT" | "ABSENT" | "LATE";
          remarks: string;
        } => record.status === "PRESENT" || record.status === "ABSENT" || record.status === "LATE",
      );

    if (records.length === 0) {
      setSaveError("Select an attendance status before saving.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      await updateAttendanceRecords(selectedSession.id, records);
      const updatedRecords = selectedSession.records.map((record) => {
        const updated = records.find((item) => item.studentId === record.studentId);
        return updated
          ? {
              ...record,
              status: updated.status,
              remarks: updated.remarks,
              updatedAt: new Date().toISOString(),
            }
          : record;
      });
      const updatedSession: AttendanceSession = {
        ...selectedSession,
        records: updatedRecords,
        totalStudents: updatedRecords.length,
        presentCount: updatedRecords.filter((record) => record.status === "PRESENT").length,
        absentCount: updatedRecords.filter((record) => record.status === "ABSENT").length,
        lateCount: updatedRecords.filter((record) => record.status === "LATE").length,
      };
      setSelectedSession(updatedSession);
      onAttendanceSaved?.(updatedSession);
      setSelectedSession(null);
      onSessionChange?.(null);
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : "Attendance could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
  const availableCourses = useMemo(
    () =>
      selectedGrade
        ? courses.filter(
            (course) =>
              course.gradeId === selectedGrade.id ||
              normalizedGrade(course.gradeName || course.grade) ===
                normalizedGrade(selectedGrade.name),
          )
        : courses,
    [courses, selectedGrade],
  );

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) => {
        const course = courses.find((item) => item.id === session.courseId);
        const matchesGrade = selectedGrade
          ? course &&
            (course.gradeId === selectedGrade.id ||
              normalizedGrade(course.gradeName || course.grade) ===
                normalizedGrade(selectedGrade.name))
          : true;
        return (
          matchesGrade && (selectedCourseId === "ALL" || session.courseId === selectedCourseId)
        );
      }),
    [courses, selectedCourseId, selectedGrade, sessions],
  );

  const metrics = useMemo(() => {
    const totalStudents = filteredSessions.reduce((sum, session) => sum + session.totalStudents, 0);
    const present = filteredSessions.reduce((sum, session) => sum + session.presentCount, 0);
    const absent = filteredSessions.reduce((sum, session) => sum + session.absentCount, 0);
    const late = filteredSessions.reduce((sum, session) => sum + session.lateCount, 0);
    return {
      attendance: totalStudents ? (present / totalStudents) * 100 : 0,
      absence: totalStudents ? (absent / totalStudents) * 100 : 0,
      present,
      absent,
      late,
    };
  }, [filteredSessions]);

  const metricCards: Array<{
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    {
      label: "Attendance rate",
      value: percentage(metrics.attendance),
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
    {
      label: "Recorded sessions",
      value: filteredSessions.length.toString(),
      icon: CalendarCheck2,
      color: "text-indigo-600",
    },
    {
      label: "Present records",
      value: metrics.present.toString(),
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Absence rate",
      value: percentage(metrics.absence),
      icon: AlertTriangle,
      color: "text-amber-600",
    },
  ];

  const selectedDistribution = useMemo(() => {
    if (!selectedSession) return null;
    const total =
      selectedSession.presentCount + selectedSession.absentCount + selectedSession.lateCount;
    const presentEnd = total ? (selectedSession.presentCount / total) * 100 : 0;
    const absentEnd = total ? presentEnd + (selectedSession.absentCount / total) * 100 : 0;
    return {
      total,
      gradient: `conic-gradient(#10b981 0 ${presentEnd}%, #f59e0b ${presentEnd}% ${absentEnd}%, #f43f5e ${absentEnd}% 100%)`,
    };
  }, [selectedSession]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        description="Review attendance sessions and participation trends across every grade and course."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Academic Management" },
          { label: "Attendance" },
        ]}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <CalendarCheck2 className="h-5 w-5 text-indigo-600" />
              Attendance filters
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Start with a grade, then narrow the sessions by course.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:min-w-[520px]">
            <label className="text-[11px] font-semibold text-slate-500">
              Grade
              <select
                value={selectedGradeId}
                onChange={(event) => {
                  setSelectedGradeId(event.target.value);
                  setSelectedCourseId("ALL");
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All grades</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {/^\d+$/.test(grade.name.trim()) ? `Grade ${grade.name}` : grade.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-semibold text-slate-500">
              Course
              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All courses</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} · {course.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Attendance data needs attention</p>
            <p className="mt-1 text-xs leading-5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{label}</span>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {value}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              {selectedGrade ? selectedGrade.name : "All grades"} · Course overview
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Attendance sessions
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredSessions.length} sessions match the selected filters.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {metrics.late} late
            </span>
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" /> {metrics.absent} absent
            </span>
          </div>
        </div>
        {filteredSessions.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="Attendance records not found"
            description="No attendance sessions are available for the selected grade and course."
            className="rounded-none border-0"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Mode</th>
                  <th className="px-4 py-3 font-semibold">Attendance</th>
                  <th className="px-4 py-3 font-semibold">Absences</th>
                  <th className="px-4 py-3 font-semibold">Marked by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSessions.map((session) => {
                  const rate = session.totalStudents
                    ? (session.presentCount / session.totalStudents) * 100
                    : 0;
                  return (
                    <tr
                      key={session.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedSession(session);
                        setStudentSearch("");
                        onSessionChange?.(session.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedSession(session);
                          setStudentSearch("");
                          onSessionChange?.(session.id);
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-slate-50/60 focus:bg-indigo-50/60 focus:outline-none dark:hover:bg-slate-800/40 dark:focus:bg-indigo-950/30"
                    >
                      <td className="px-4 py-3">
                        <span className="block font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {session.courseCode}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {session.courseTitle}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {session.date}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{session.timeSlot}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {session.mode.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-emerald-600">
                          {session.presentCount}/{session.totalStudents} ({percentage(rate)})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-rose-600">
                        {session.absentCount} absent · {session.lateCount} late
                      </td>
                      <td className="px-4 py-3 text-slate-500">{session.markedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedSession(null);
              onSessionChange?.(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-detail-title"
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                  Attendance details
                </p>
                <h2
                  id="attendance-detail-title"
                  className="mt-1 text-lg font-bold text-slate-900 dark:text-white"
                >
                  {selectedSession.courseTitle}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedSession.date} · {selectedSession.timeSlot} · Marked by{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedSession.markedBy}
                  </span>
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${selectedSession.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : selectedSession.status === "CANCELLED" ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"}`}
                >
                  {selectedSession.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void saveAttendance()}
                  disabled={isSaving || selectedSession.status === "CANCELLED"}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  aria-label="Close attendance details"
                  onClick={() => {
                    setSelectedSession(null);
                    onSessionChange?.(null);
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
              <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  Present
                </p>
                <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {selectedSession.presentCount}
                </p>
              </div>
              <div className="rounded-xl bg-rose-50 p-3 dark:bg-rose-950/30">
                <p className="text-[11px] font-medium text-rose-700 dark:text-rose-300">Absent</p>
                <p className="mt-1 text-xl font-bold text-rose-700 dark:text-rose-300">
                  {selectedSession.absentCount}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">Late</p>
                <p className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-300">
                  {selectedSession.lateCount}
                </p>
              </div>
            </div>

            {selectedDistribution && selectedDistribution.total > 0 && (
              <div className="grid grid-cols-1 gap-6 border-b border-slate-200 p-5 dark:border-slate-800 sm:grid-cols-[minmax(180px,0.8fr)_minmax(0,1fr)] sm:items-center">
                <div className="flex justify-center">
                  <div
                    className="relative h-44 w-44 rounded-full"
                    style={{ background: selectedDistribution.gradient }}
                    aria-label="Attendance distribution chart"
                  >
                    <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                      <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                        {selectedDistribution.total}
                      </span>
                      <span className="mt-1 text-[10px] text-slate-500">total records</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      label: "Present",
                      count: selectedSession.presentCount,
                      color: "bg-emerald-500",
                    },
                    { label: "Absent", count: selectedSession.absentCount, color: "bg-rose-500" },
                    { label: "Late", count: selectedSession.lateCount, color: "bg-amber-500" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 text-xs"
                    >
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        {item.label}
                      </span>
                      <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                        {item.count} ({Math.round((item.count / selectedDistribution.total) * 100)}
                        %)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-[50vh] overflow-y-auto p-5">
              {saveError && (
                <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                  {saveError}
                </p>
              )}
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="search"
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Filter by student name or ID..."
                  aria-label="Filter students by name or ID"
                  className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200"
                />
              </div>
              {selectedSession.records.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Student attendance not found"
                  description="This session does not have any student attendance records."
                  className="border-0"
                />
              ) : selectedSession.records.filter((record) => {
                  const query = studentSearch.trim().toLowerCase();
                  if (!query) return true;
                  return [record.studentName, record.studentId].some((value) =>
                    value?.toLowerCase().includes(query),
                  );
                }).length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Student not found"
                  description="No student matches the name or ID you entered."
                  className="border-0"
                />
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Student</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Remarks</th>
                        <th className="px-4 py-3 font-semibold">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedSession.records
                        .filter((record) => {
                          const query = studentSearch.trim().toLowerCase();
                          if (!query) return true;
                          return [record.studentName, record.studentId].some((value) =>
                            value?.toLowerCase().includes(query),
                          );
                        })
                        .map((record) => {
                          const currentStatus = draftRecords[record.id]?.status || record.status;
                          const statusClass =
                            currentStatus === "PRESENT"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : currentStatus === "ABSENT"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                                : currentStatus === "LATE"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
                          return (
                            <tr key={record.id}>
                              <td className="px-4 py-3">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {record.studentName || "Student name unavailable"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={draftRecords[record.id]?.status || record.status}
                                  onChange={(event) =>
                                    setDraftRecords((current) => ({
                                      ...current,
                                      [record.id]: {
                                        status: event.target.value as AttendanceRecord["status"],
                                        remarks:
                                          current[record.id]?.remarks ?? record.remarks ?? "",
                                      },
                                    }))
                                  }
                                  className={`rounded-lg border-0 px-2 py-1 text-[10px] font-bold uppercase outline-none ${statusClass}`}
                                  aria-label={`Attendance status for ${record.studentName || record.studentId}`}
                                >
                                  <option value="NOT_MARKED">Not marked</option>
                                  <option value="PRESENT">Present</option>
                                  <option value="ABSENT">Absent</option>
                                  <option value="LATE">Late</option>
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  value={draftRecords[record.id]?.remarks ?? record.remarks ?? ""}
                                  onChange={(event) =>
                                    setDraftRecords((current) => ({
                                      ...current,
                                      [record.id]: {
                                        status: current[record.id]?.status ?? record.status,
                                        remarks: event.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Add a note"
                                  className="w-full min-w-32 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:text-slate-300"
                                  aria-label={`Remarks for ${record.studentName || record.studentId}`}
                                />
                              </td>
                              <td className="px-4 py-3 text-slate-500">
                                {record.markedAt ? new Date(record.markedAt).toLocaleString() : "—"}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 p-5 dark:border-slate-800">
              <p className="text-[11px] text-slate-500">
                Admin changes can be saved even after a session is completed.
              </p>
              <button
                type="button"
                onClick={() => void saveAttendance()}
                disabled={isSaving || selectedSession.status === "CANCELLED"}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

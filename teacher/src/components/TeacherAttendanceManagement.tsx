"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { AttendanceSession, AttendanceStatus, TeacherCourse } from "../lib/teacherApi";
import { teacherApi } from "../lib/teacherApi";

type Props = { courses: TeacherCourse[] };
type SessionForm = { title: string; attendanceDate: string; startTime: string; endTime: string };

const emptyForm = (): SessionForm => ({
  title: "",
  attendanceDate: new Date().toISOString().slice(0, 10),
  startTime: "09:00",
  endTime: "10:00",
});

function courseName(courses: TeacherCourse[], courseId: string) {
  return courses.find((course) => course.id === courseId)?.courseName || "Unknown course";
}

function displayId(value: string) {
  return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

export default function TeacherAttendanceManagement({ courses }: Props) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [sessionForm, setSessionForm] = useState<SessionForm>(emptyForm);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const activeCourseId = courseId || courses[0]?.id || "";

  useEffect(() => {
    let cancelled = false;
    async function loadSessions() {
      if (!activeCourseId) {
        setSessions([]);
        setSelectedSession(null);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const loaded = await teacherApi.attendanceSessions(activeCourseId);
        if (!cancelled) {
          setSessions(loaded);
          setSelectedSession(loaded[0] || null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setSessions([]);
          setSelectedSession(null);
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load attendance sessions.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadSessions();
    return () => {
      cancelled = true;
    };
  }, [activeCourseId]);

  const visibleRecords = useMemo(() => {
    if (!selectedSession) return [];
    const normalized = query.trim().toLowerCase();
    return selectedSession.records.filter((record) => {
      const matchesStatus = statusFilter === "ALL" || record.status === statusFilter;
      return matchesStatus && (!normalized || record.studentId.toLowerCase().includes(normalized));
    });
  }, [query, selectedSession, statusFilter]);
  const attended =
    selectedSession?.records.filter((record) => ["PRESENT", "LATE"].includes(record.status))
      .length || 0;
  const total = selectedSession?.records.length || 0;
  const attendanceRate = total ? Math.round((attended / total) * 100) : 0;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }
  function replaceSession(updated: AttendanceSession) {
    setSessions((current) =>
      current.map((session) => (session.id === updated.id ? updated : session)),
    );
    setSelectedSession(updated);
  }
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "The attendance request failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function createSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeCourseId) return;
    await run(async () => {
      const created = await teacherApi.createAttendanceSession({
        courseId: activeCourseId,
        ...sessionForm,
      });
      setSessions((current) => [created, ...current]);
      setSelectedSession(created);
      setSessionForm(emptyForm());
      notify("Attendance session created.");
    });
  }
  async function saveAttendance() {
    if (!selectedSession) return;
    await run(async () => {
      replaceSession(
        await teacherApi.markAttendance(
          selectedSession.id,
          selectedSession.records.map((record) => ({
            studentId: record.studentId,
            status: record.status,
            remarks: record.remarks,
          })),
        ),
      );
      notify("Attendance saved.");
    });
  }
  function updateRecord(studentId: string, status: AttendanceStatus) {
    setSelectedSession((current) =>
      current
        ? {
            ...current,
            records: current.records.map((record) =>
              record.studentId === studentId ? { ...record, status } : record,
            ),
          }
        : current,
    );
  }

  return (
    <section
      className="teacher-attendance-management"
      aria-labelledby="attendance-management-title"
    >
      {notice && (
        <div className="teacher-attendance-notice" role="status">
          {notice}
        </div>
      )}
      <div className="teacher-attendance-heading">
        <div>
          <div className="teacher-attendance-title-row">
            <h2 id="attendance-management-title">Attendance Management</h2>
            <span>Live attendance sessions</span>
          </div>
          <p>Create attendance sessions, mark enrolled students, and complete daily records.</p>
        </div>
        <div className="teacher-attendance-heading-actions">
          <button
            type="button"
            onClick={() => void saveAttendance()}
            disabled={busy || !selectedSession || selectedSession.status !== "OPEN"}
          >
            Save Attendance
          </button>
          <button
            type="button"
            className="primary"
            onClick={() =>
              document
                .getElementById("attendance-session-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Take Attendance
          </button>
        </div>
      </div>
      <div className="teacher-attendance-stats">
        <article>
          <small>ATTENDED</small>
          <strong>
            {attended}
            <i>/ {total}</i>
          </strong>
          <span className="good">{attendanceRate}%</span>
          <p>Present or late in selected session</p>
          <div className="teacher-attendance-bar">
            <span style={{ width: `${attendanceRate}%` }} />
          </div>
        </article>
        <article>
          <small>SESSIONS</small>
          <strong>{sessions.length}</strong>
          <span className="good">
            {sessions.filter((session) => session.status === "OPEN").length} open
          </span>
          <p>{courseName(courses, activeCourseId)}</p>
          <div className="teacher-attendance-bar">
            <span style={{ width: `${sessions.length ? 100 : 0}%` }} />
          </div>
        </article>
        <article>
          <small>SESSION STATUS</small>
          <strong>{selectedSession?.status || "—"}</strong>
          <span className={selectedSession?.status === "COMPLETED" ? "good" : "risk"}>
            {selectedSession ? selectedSession.attendanceDate : "Select a session"}
          </span>
          <p>Records are saved through the attendance service</p>
        </article>
      </div>
      <div className="teacher-attendance-toolbar">
        <select
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
          aria-label="Filter by course"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.courseName}
            </option>
          ))}
        </select>
        <label className="teacher-attendance-search">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student IDs..."
            aria-label="Search students"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by attendance status"
        >
          <option value="ALL">All statuses</option>
          <option value="NOT_MARKED">Not marked</option>
          <option value="PRESENT">Present</option>
          <option value="LATE">Late</option>
          <option value="ABSENT">Absent</option>
        </select>
      </div>
      {error && (
        <div className="teacher-attendance-notice" role="alert">
          {error}
        </div>
      )}
      <div className="teacher-attendance-table-wrap">
        <div className="teacher-attendance-table-scroll">
          {loading ? (
            <div className="teacher-attendance-empty">Loading attendance sessions…</div>
          ) : (
            <div className="teacher-attendance-session-layout">
              <section>
                <div className="teacher-attendance-section-heading">
                  <h3>Sessions</h3>
                  <span>{sessions.length}</span>
                </div>
                <form
                  id="attendance-session-form"
                  className="teacher-attendance-session-form"
                  onSubmit={(event) => void createSession(event)}
                >
                  <input
                    required
                    value={sessionForm.title}
                    onChange={(event) =>
                      setSessionForm({ ...sessionForm, title: event.target.value })
                    }
                    placeholder="Session title"
                    aria-label="Session title"
                  />
                  <input
                    required
                    type="date"
                    value={sessionForm.attendanceDate}
                    onChange={(event) =>
                      setSessionForm({ ...sessionForm, attendanceDate: event.target.value })
                    }
                  />
                  <div>
                    <input
                      required
                      type="time"
                      value={sessionForm.startTime}
                      onChange={(event) =>
                        setSessionForm({ ...sessionForm, startTime: event.target.value })
                      }
                    />
                    <input
                      required
                      type="time"
                      value={sessionForm.endTime}
                      onChange={(event) =>
                        setSessionForm({ ...sessionForm, endTime: event.target.value })
                      }
                    />
                  </div>
                  <button type="submit" disabled={busy || !activeCourseId}>
                    Create session
                  </button>
                </form>
                <div className="teacher-attendance-session-list">
                  {sessions.map((session) => (
                    <button
                      type="button"
                      key={session.id}
                      className={selectedSession?.id === session.id ? "active" : ""}
                      onClick={() => setSelectedSession(session)}
                    >
                      <strong>{session.title}</strong>
                      <span>
                        {session.attendanceDate} · {session.status}
                      </span>
                      <em>{session.records.length} records</em>
                    </button>
                  ))}
                  {!sessions.length && (
                    <p className="teacher-side-muted">No attendance sessions for this course.</p>
                  )}
                </div>
              </section>
              <section>
                <div className="teacher-attendance-section-heading">
                  <h3>{selectedSession?.title || "Select a session"}</h3>
                  <span>{selectedSession ? `${attended}/${total} attended` : ""}</span>
                </div>
                {selectedSession ? (
                  <>
                    <div className="teacher-attendance-record-list">
                      {visibleRecords.map((record) => (
                        <div className="teacher-attendance-record-row" key={record.studentId}>
                          <strong>{displayId(record.studentId)}</strong>
                          <select
                            value={record.status}
                            disabled={selectedSession.status !== "OPEN"}
                            onChange={(event) =>
                              updateRecord(record.studentId, event.target.value as AttendanceStatus)
                            }
                          >
                            <option value="NOT_MARKED">Not marked</option>
                            <option value="PRESENT">Present</option>
                            <option value="LATE">Late</option>
                            <option value="ABSENT">Absent</option>
                          </select>
                          <input
                            defaultValue={record.remarks || ""}
                            disabled={selectedSession.status !== "OPEN"}
                            placeholder="Remarks"
                            aria-label={`Remarks for ${record.studentId}`}
                          />
                        </div>
                      ))}
                      {!visibleRecords.length && (
                        <p className="teacher-attendance-empty">
                          No attendance records match the selected filters.
                        </p>
                      )}
                    </div>
                    <div className="teacher-attendance-heading-actions">
                      <button
                        type="button"
                        disabled={busy || selectedSession.status !== "OPEN"}
                        onClick={() => void saveAttendance()}
                      >
                        Save records
                      </button>
                      <button
                        type="button"
                        disabled={busy || selectedSession.status !== "OPEN"}
                        onClick={() =>
                          void run(async () => {
                            replaceSession(await teacherApi.completeAttendance(selectedSession.id));
                            notify("Attendance session completed.");
                          })
                        }
                      >
                        Complete session
                      </button>
                      <button
                        type="button"
                        disabled={busy || selectedSession.status !== "OPEN"}
                        onClick={() =>
                          void run(async () => {
                            replaceSession(await teacherApi.cancelAttendance(selectedSession.id));
                            notify("Attendance session cancelled.");
                          })
                        }
                      >
                        Cancel session
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="teacher-side-muted">
                    Create or select a session to mark attendance.
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

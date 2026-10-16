"use client";

import { useEffect, useMemo, useState } from "react";
import {
  teacherApi,
  type AttendanceSession,
  type AttendanceStatus,
  type Exam,
  type ExamResultSheet,
  type ExamSummary,
  type ExamType,
  type TeacherCourse,
} from "../lib/teacherApi";

const emptySession = {
  title: "",
  attendanceDate: new Date().toISOString().slice(0, 10),
  startTime: "09:00",
  endTime: "10:00",
};
const emptyExam: {
  title: string;
  description: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passMarks: number;
  type: ExamType;
} = {
  title: "",
  description: "",
  examDate: new Date().toISOString().slice(0, 10),
  startTime: "09:00",
  endTime: "11:00",
  totalMarks: 100,
  passMarks: 40,
  type: "MIDTERM",
};

export default function TeacherAttendanceWorkspace({ courses }: { courses: TeacherCourse[] }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [resultSheet, setResultSheet] = useState<ExamResultSheet | null>(null);
  const [examSummary, setExamSummary] = useState<ExamSummary | null>(null);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [sessionForm, setSessionForm] = useState(emptySession);
  const [examForm, setExamForm] = useState(emptyExam);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(success);
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "The request could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  };
  const loadCourseData = async (nextCourseId: string) => {
    if (!nextCourseId) return;
    setCourseId(nextCourseId);
    setSelectedSession(null);
    setSelectedExam(null);
    setResultSheet(null);
    setExamSummary(null);
    setEditingExamId(null);
    setError("");
    try {
      const [nextSessions, nextExams] = await Promise.all([
        teacherApi.attendanceSessions(nextCourseId),
        teacherApi.exams(nextCourseId),
      ]);
      setSessions(nextSessions);
      setExams(nextExams);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load attendance and exam data.",
      );
    }
  };
  // Data loading is intentionally triggered when the assigned course list becomes available.
  useEffect(() => {
    if (courses[0]?.id) {
      // The loader updates the request state after the course list is available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadCourseData(courses[0].id);
    }
  }, [courses]);
  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === courseId),
    [courses, courseId],
  );
  const updateSessionRecord = (studentId: string, status: AttendanceStatus) =>
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
  const updateExamResult = (
    studentId: string,
    patch: Partial<NonNullable<ExamResultSheet>["results"][number]>,
  ) =>
    setResultSheet((current) =>
      current
        ? {
            ...current,
            results: current.results.map((result) =>
              result.studentId === studentId ? { ...result, ...patch } : result,
            ),
          }
        : current,
    );
  const selectExam = (exam: Exam) =>
    void run(async () => {
      const detail = await teacherApi.exam(exam.id);
      setSelectedExam(detail);
      setResultSheet(null);
      setExamSummary(null);
    }, "Exam details loaded.");
  const beginExamEdit = (exam: Exam) => {
    setEditingExamId(exam.id);
    setExamForm({
      title: exam.title,
      description: exam.description || "",
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      totalMarks: Number(exam.totalMarks),
      passMarks: Number(exam.passMarks),
      type: exam.type,
    });
    setSelectedExam(exam);
    setResultSheet(null);
    setExamSummary(null);
  };
  const replaceExam = (updated: Exam) => {
    setSelectedExam(updated);
    setExams((current) => current.map((exam) => (exam.id === updated.id ? updated : exam)));
  };

  return (
    <section className="teacher-assessment-workspace">
      <div className="teacher-sample-heading">
        <div>
          <span className="teacher-kicker">ATTENDANCE &amp; EXAMS</span>
          <h2>Class operations</h2>
          <p>Manage attendance sessions, exam schedules, and marks for your assigned courses.</p>
        </div>
        <label className="teacher-assessment-course">
          Course
          <select value={courseId} onChange={(event) => void loadCourseData(event.target.value)}>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <div className="teacher-inline-error">{error}</div>}
      {notice && <div className="teacher-inline-success">{notice}</div>}
      {!selectedCourse ? (
        <div className="teacher-empty">
          <strong>No assigned course</strong>
          <p>Attendance and exams become available when a course is assigned.</p>
        </div>
      ) : (
        <div className="teacher-assessment-grid">
          <section className="teacher-assessment-card">
            <div className="teacher-section-heading">
              <div>
                <span className="teacher-kicker">ATTENDANCE</span>
                <h3>Sessions</h3>
              </div>
              <span>{sessions.length}</span>
            </div>
            <form
              className="teacher-assessment-form"
              onSubmit={(event) => {
                event.preventDefault();
                void run(async () => {
                  const created = await teacherApi.createAttendanceSession({
                    courseId,
                    ...sessionForm,
                  });
                  setSessions((current) => [created, ...current]);
                  setSelectedSession(created);
                  setSessionForm(emptySession);
                }, "Attendance session created.");
              }}
            >
              <input
                required
                placeholder="Session title"
                value={sessionForm.title}
                onChange={(event) => setSessionForm({ ...sessionForm, title: event.target.value })}
              />
              <div className="teacher-form-row">
                <input
                  required
                  type="date"
                  value={sessionForm.attendanceDate}
                  onChange={(event) =>
                    setSessionForm({ ...sessionForm, attendanceDate: event.target.value })
                  }
                />
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
              <button disabled={busy}>Create session</button>
            </form>
            <div className="teacher-assessment-list">
              {sessions.map((session) => (
                <button
                  type="button"
                  className={selectedSession?.id === session.id ? "active" : ""}
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                >
                  <strong>{session.title}</strong>
                  <span>
                    {session.attendanceDate} · {session.status}
                  </span>
                  <em>{session.records.length} students</em>
                </button>
              ))}
              {!sessions.length && (
                <p className="teacher-side-muted">No attendance sessions yet.</p>
              )}
            </div>
          </section>
          <section className="teacher-assessment-card teacher-assessment-detail">
            <div className="teacher-section-heading">
              <div>
                <span className="teacher-kicker">MARKING</span>
                <h3>{selectedSession?.title || "Select a session"}</h3>
              </div>
              {selectedSession && (
                <span>
                  {
                    selectedSession.records.filter(
                      (record) => record.status === "PRESENT" || record.status === "LATE",
                    ).length
                  }
                  /{selectedSession.records.length} attended
                </span>
              )}
            </div>
            {selectedSession ? (
              <>
                <div className="teacher-record-list">
                  {selectedSession.records.map((record) => (
                    <div className="teacher-record-row" key={record.studentId}>
                      <strong>{record.studentId}</strong>
                      <select
                        value={record.status}
                        disabled={selectedSession.status !== "OPEN"}
                        onChange={(event) =>
                          updateSessionRecord(
                            record.studentId,
                            event.target.value as AttendanceStatus,
                          )
                        }
                      >
                        <option value="NOT_MARKED">Not marked</option>
                        <option value="PRESENT">Present</option>
                        <option value="LATE">Late</option>
                        <option value="ABSENT">Absent</option>
                      </select>
                    </div>
                  ))}
                </div>
                <div className="teacher-assessment-actions">
                  <button
                    disabled={busy || selectedSession.status !== "OPEN"}
                    onClick={() =>
                      void run(async () => {
                        const updated = await teacherApi.markAttendance(
                          selectedSession.id,
                          selectedSession.records.map((record) => ({
                            studentId: record.studentId,
                            status: record.status,
                            remarks: record.remarks,
                          })),
                        );
                        setSelectedSession(updated);
                        setSessions((current) =>
                          current.map((session) => (session.id === updated.id ? updated : session)),
                        );
                      }, "Attendance saved.")
                    }
                  >
                    Save attendance
                  </button>
                  <button
                    disabled={busy || selectedSession.status !== "OPEN"}
                    onClick={() =>
                      void run(async () => {
                        const updated = await teacherApi.completeAttendance(selectedSession.id);
                        setSelectedSession(updated);
                        setSessions((current) =>
                          current.map((session) => (session.id === updated.id ? updated : session)),
                        );
                      }, "Attendance session completed.")
                    }
                  >
                    Complete
                  </button>
                  <button
                    className="danger"
                    disabled={busy || selectedSession.status !== "OPEN"}
                    onClick={() =>
                      void run(async () => {
                        const updated = await teacherApi.cancelAttendance(selectedSession.id);
                        setSelectedSession(updated);
                        setSessions((current) =>
                          current.map((session) => (session.id === updated.id ? updated : session)),
                        );
                      }, "Attendance session cancelled.")
                    }
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p className="teacher-side-muted">
                Create or select a session to mark enrolled students.
              </p>
            )}
          </section>
          <section className="teacher-assessment-card">
            <div className="teacher-section-heading">
              <div>
                <span className="teacher-kicker">EXAMS</span>
                <h3>Exam schedule</h3>
              </div>
              <span>{exams.length}</span>
            </div>
            <form
              className="teacher-assessment-form"
              onSubmit={(event) => {
                event.preventDefault();
                void run(
                  async () => {
                    const saved = editingExamId
                      ? await teacherApi.updateExam(editingExamId, examForm)
                      : await teacherApi.createExam({ courseId, ...examForm });
                    setExams((current) =>
                      editingExamId
                        ? current.map((exam) => (exam.id === saved.id ? saved : exam))
                        : [saved, ...current],
                    );
                    setSelectedExam(saved);
                    setExamForm(emptyExam);
                    setEditingExamId(null);
                  },
                  editingExamId ? "Exam updated." : "Exam created.",
                );
              }}
            >
              <input
                required
                placeholder="Exam title"
                value={examForm.title}
                onChange={(event) => setExamForm({ ...examForm, title: event.target.value })}
              />
              <textarea
                placeholder="Description (optional)"
                value={examForm.description}
                onChange={(event) => setExamForm({ ...examForm, description: event.target.value })}
              />
              <div className="teacher-form-row">
                <input
                  required
                  type="date"
                  value={examForm.examDate}
                  onChange={(event) => setExamForm({ ...examForm, examDate: event.target.value })}
                />
                <input
                  required
                  type="time"
                  value={examForm.startTime}
                  onChange={(event) => setExamForm({ ...examForm, startTime: event.target.value })}
                />
                <input
                  required
                  type="time"
                  value={examForm.endTime}
                  onChange={(event) => setExamForm({ ...examForm, endTime: event.target.value })}
                />
              </div>
              <div className="teacher-form-row">
                <input
                  required
                  type="number"
                  min="1"
                  value={examForm.totalMarks}
                  onChange={(event) =>
                    setExamForm({ ...examForm, totalMarks: Number(event.target.value) })
                  }
                />
                <input
                  required
                  type="number"
                  min="0"
                  value={examForm.passMarks}
                  onChange={(event) =>
                    setExamForm({ ...examForm, passMarks: Number(event.target.value) })
                  }
                />
                <select
                  value={examForm.type}
                  onChange={(event) =>
                    setExamForm({ ...examForm, type: event.target.value as typeof examForm.type })
                  }
                >
                  <option>MIDTERM</option>
                  <option>FINAL</option>
                  <option>PRACTICAL</option>
                  <option>OTHER</option>
                </select>
              </div>
              <div className="teacher-assessment-actions">
                <button disabled={busy}>{editingExamId ? "Update exam" : "Create exam"}</button>
                {editingExamId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExamId(null);
                      setExamForm(emptyExam);
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
            <div className="teacher-assessment-list">
              {exams.map((exam) => (
                <button
                  type="button"
                  className={selectedExam?.id === exam.id ? "active" : ""}
                  key={exam.id}
                  onClick={() => selectExam(exam)}
                >
                  <strong>{exam.title}</strong>
                  <span>
                    {exam.examDate} · {exam.status}
                  </span>
                  <em>{exam.totalMarks} marks</em>
                </button>
              ))}
              {!exams.length && <p className="teacher-side-muted">No exams yet.</p>}
            </div>
          </section>
          <section className="teacher-assessment-card teacher-assessment-detail">
            <div className="teacher-section-heading">
              <div>
                <span className="teacher-kicker">RESULTS</span>
                <h3>{selectedExam?.title || "Select an exam"}</h3>
              </div>
              {selectedExam && <span>{selectedExam.status}</span>}
            </div>
            {selectedExam ? (
              <>
                <div className="teacher-assessment-actions">
                  <button
                    type="button"
                    onClick={() => beginExamEdit(selectedExam)}
                    disabled={busy || selectedExam.status !== "DRAFT"}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy || selectedExam.status !== "DRAFT"}
                    onClick={() =>
                      void run(
                        async () => replaceExam(await teacherApi.scheduleExam(selectedExam.id)),
                        "Exam scheduled.",
                      )
                    }
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    disabled={busy || selectedExam.status !== "SCHEDULED"}
                    onClick={() =>
                      void run(
                        async () => replaceExam(await teacherApi.startExamMarking(selectedExam.id)),
                        "Exam opened for marking.",
                      )
                    }
                  >
                    Start marking
                  </button>
                  <button
                    type="button"
                    disabled={
                      busy ||
                      selectedExam.status === "CANCELLED" ||
                      selectedExam.status === "COMPLETED"
                    }
                    onClick={() =>
                      void run(
                        async () => replaceExam(await teacherApi.cancelExam(selectedExam.id)),
                        "Exam cancelled.",
                      )
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        async () => setResultSheet(await teacherApi.examResults(selectedExam.id)),
                        "Results loaded.",
                      )
                    }
                  >
                    Load results
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        async () => setExamSummary(await teacherApi.examSummary(selectedExam.id)),
                        "Summary loaded.",
                      )
                    }
                  >
                    Summary
                  </button>
                </div>
                {examSummary && (
                  <div className="teacher-sample-stats">
                    <div>
                      <small>STUDENTS</small>
                      <b>{examSummary.totalStudents}</b>
                    </div>
                    <div>
                      <small>PRESENT</small>
                      <b>{examSummary.presentStudents}</b>
                    </div>
                    <div>
                      <small>PASSED</small>
                      <b>{examSummary.passedStudents}</b>
                    </div>
                    <div>
                      <small>AVERAGE</small>
                      <b>{examSummary.averageMarks ?? "—"}</b>
                    </div>
                  </div>
                )}
                {resultSheet && (
                  <>
                    <div className="teacher-record-list">
                      {resultSheet.results.map((result) => (
                        <div className="teacher-record-row" key={result.studentId}>
                          <strong>{result.studentId}</strong>
                          <select
                            value={result.attendanceStatus}
                            onChange={(event) =>
                              updateExamResult(result.studentId, {
                                attendanceStatus: event.target.value as "PRESENT" | "ABSENT",
                              })
                            }
                          >
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                          </select>
                          <input
                            type="number"
                            min="0"
                            max={Number(resultSheet.totalMarks)}
                            value={result.marksObtained ?? ""}
                            onChange={(event) =>
                              updateExamResult(result.studentId, {
                                marksObtained:
                                  event.target.value === ""
                                    ? undefined
                                    : Number(event.target.value),
                              })
                            }
                            placeholder="Marks"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="teacher-assessment-actions">
                      <button
                        type="button"
                        disabled={busy || selectedExam.status !== "MARKING"}
                        onClick={() =>
                          void run(async () => {
                            const updated = await teacherApi.enterExamMarks(
                              selectedExam.id,
                              resultSheet.results.map((result) => ({
                                studentId: result.studentId,
                                attendanceStatus: result.attendanceStatus,
                                marksObtained: result.marksObtained,
                                remarks: result.remarks,
                              })),
                            );
                            setResultSheet({ ...resultSheet, results: updated.results });
                          }, "Marks saved.")
                        }
                      >
                        Save marks
                      </button>
                      <button
                        type="button"
                        disabled={busy || selectedExam.status !== "MARKING"}
                        onClick={() =>
                          void run(
                            async () => replaceExam(await teacherApi.completeExam(selectedExam.id)),
                            "Exam completed.",
                          )
                        }
                      >
                        Complete exam
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="teacher-side-muted">
                Select an exam to review its details, manage lifecycle, or open its result sheet.
              </p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

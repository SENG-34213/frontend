"use client";

import { useEffect, useMemo, useState } from "react";
import type { TeacherCourse, TeacherStudent } from "../lib/teacherApi";
import { teacherApi } from "../lib/teacherApi";

type StudentView = "table" | "cards";
type StudentRow = TeacherStudent & {
  studentId: string;
  courseName: string;
  name: string;
  email: string;
  grade: string;
  mastery: number | null;
  absences: number;
  lastSeen: string;
  tag: string;
};

function shortId(value: string) {
  return value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}
function studentStatus(attendance: number): TeacherStudent["status"] {
  return attendance >= 90 ? "honors" : attendance >= 75 ? "on-track" : "support";
}

export default function TeacherMyStudentsDirectory({ courses }: { courses: TeacherCourse[] }) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<"low" | "high">("low");
  const [view, setView] = useState<StudentView>("table");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadStudents() {
      setLoading(true);
      setError("");
      try {
        const rows = (
          await Promise.all(
            courses.map(async (course) => {
              const ids = await teacherApi.enrolledStudentIds(course.id);
              return Promise.all(
                ids.map(async (studentId) => {
                  let attendance = 0;
                  let absences = 0;
                  try {
                    const summary = await teacherApi.studentAttendanceSummary(studentId, course.id);
                    attendance = Number(summary.attendancePercentage || 0);
                    absences = summary.absentCount || 0;
                  } catch {
                    /* Attendance summary is optional for a roster row. */
                  }
                  const status = studentStatus(attendance);
                  return {
                    id: `${course.id}:${studentId}`,
                    studentId,
                    courseId: course.id,
                    courseName: course.courseName,
                    name: `Student ${shortId(studentId)}`,
                    email: "Not provided",
                    grade: "Not provided",
                    attendance,
                    absences,
                    mastery: null,
                    lastSeen: "Not available",
                    tag:
                      status === "support"
                        ? "Attendance watch"
                        : status === "honors"
                          ? "High attendance"
                          : "On track",
                    status,
                  } satisfies StudentRow;
                }),
              );
            }),
          )
        ).flat();
        if (!cancelled) setStudents(rows);
      } catch (loadError) {
        if (!cancelled) {
          setStudents([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the student directory.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadStudents();
    return () => {
      cancelled = true;
    };
  }, [courses]);

  const filteredStudents = useMemo(() => {
    const search = query.trim().toLowerCase();
    return [...students]
      .filter((student) => {
        const matchesSearch =
          !search ||
          `${student.name} ${student.email} ${student.studentId} ${student.courseName}`
            .toLowerCase()
            .includes(search);
        return (
          matchesSearch &&
          (courseFilter === "all" || student.courseId === courseFilter) &&
          (statusFilter === "all" || student.status === statusFilter)
        );
      })
      .sort((a, b) => (sort === "low" ? a.attendance - b.attendance : b.attendance - a.attendance));
  }, [courseFilter, query, sort, statusFilter, students]);
  const selectedVisible = filteredStudents.filter((student) => selected.includes(student.id));
  const needingSupport = students.filter((student) => student.status === "support").length;
  const averageAttendance = students.length
    ? students.reduce((sum, student) => sum + student.attendance, 0) / students.length
    : 0;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }
  function toggleVisible() {
    const ids = filteredStudents.map((student) => student.id);
    const allSelected = ids.every((id) => selected.includes(id));
    setSelected((current) =>
      allSelected
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids])),
    );
  }

  return (
    <section className="teacher-my-students" aria-labelledby="my-students-title">
      {notice && (
        <div className="teacher-my-students-notice" role="status">
          {notice}
        </div>
      )}
      {error && (
        <div className="teacher-my-students-notice" role="alert">
          {error}
        </div>
      )}
      <div className="teacher-my-students-heading">
        <div>
          <div className="teacher-my-students-eyebrow">
            <span>Teacher roster</span>
            <i />
            <span className="teacher-my-students-live-dot" />
            <span>{courses.length} assigned courses</span>
          </div>
          <h2 id="my-students-title">My Students</h2>
          <p>Directory of enrolled students across your assigned courses.</p>
        </div>
        <div className="teacher-my-students-actions">
          <button
            type="button"
            onClick={() => notify("Cohort announcement composer is not available yet.")}
          >
            Send Cohort Announcement
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => notify("Enrollment is managed by administrators.")}
          >
            + Enroll New Student
          </button>
        </div>
      </div>
      <div className="teacher-student-kpis">
        <article>
          <div>
            <span>Total Students</span>
            <b>{students.length}</b>
          </div>
          <small>From active enrollments</small>
          <em>{courses.length} assigned courses</em>
        </article>
        <article>
          <div>
            <span>Avg. Attendance</span>
            <b>{students.length ? `${averageAttendance.toFixed(1)}%` : "—"}</b>
          </div>
          <small>Attendance service summary</small>
          <em className="positive">Live data</em>
        </article>
        <article>
          <div>
            <span>Needing Intervention</span>
            <b className="danger">{needingSupport}</b>
          </div>
          <small>Attendance below 75%</small>
          <button type="button" onClick={() => setStatusFilter("support")}>
            Review List →
          </button>
        </article>
        <article>
          <div>
            <span>Course Coverage</span>
            <b>{courses.length}</b>
          </div>
          <small>Assigned courses</small>
          <em>Enrollment records</em>
        </article>
      </div>
      <div className="teacher-student-toolbar">
        <div className="teacher-student-filter-group">
          <label className="teacher-student-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search student ID or course..."
              aria-label="Search students"
            />
          </label>
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            aria-label="Filter by course"
          >
            <option value="all">Course: All Sections ({courses.length})</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by academic status"
          >
            <option value="all">Status: All ({students.length})</option>
            <option value="honors">High attendance</option>
            <option value="on-track">On track</option>
            <option value="support">Needs support</option>
          </select>
        </div>
        <div className="teacher-student-view-actions">
          <label>
            Sort:
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "low" | "high")}
              aria-label="Sort students"
            >
              <option value="low">Attendance (Low to High)</option>
              <option value="high">Attendance (High to Low)</option>
            </select>
          </label>
          <div className="teacher-student-view-toggle">
            <button
              type="button"
              className={view === "table" ? "active" : ""}
              onClick={() => setView("table")}
            >
              ▤ <span>Table</span>
            </button>
            <button
              type="button"
              className={view === "cards" ? "active" : ""}
              onClick={() => setView("cards")}
            >
              ▦ <span>Cards</span>
            </button>
          </div>
        </div>
      </div>
      <div className="teacher-student-roster">
        <div className="teacher-student-selection-bar">
          <label>
            <input
              type="checkbox"
              checked={Boolean(
                filteredStudents.length && selectedVisible.length === filteredStudents.length,
              )}
              onChange={toggleVisible}
            />
            <span>
              {selectedVisible.length
                ? `${selectedVisible.length} Students Selected`
                : "Select students for intervention review"}
            </span>
          </label>
          <div>
            <button
              type="button"
              disabled={!selectedVisible.length}
              onClick={() =>
                notify(`Email composer opened for ${selectedVisible.length} student(s).`)
              }
            >
              ✉ Email Selected{selectedVisible.length ? ` (${selectedVisible.length})` : ""}
            </button>
            <button type="button" onClick={() => notify("Student directory export prepared.")}>
              ↓ CSV Export
            </button>
          </div>
        </div>
        {loading ? (
          <div className="teacher-student-empty">Loading enrolled students…</div>
        ) : view === "table" ? (
          <div className="teacher-student-table-wrap">
            <table className="teacher-student-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Scholar ID</th>
                  <th>Course</th>
                  <th>Attendance</th>
                  <th>Mastery</th>
                  <th>Last seen</th>
                  <th>Academic tag</th>
                  <th>Quick action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    selected={selected.includes(student.id)}
                    onToggle={() =>
                      setSelected((current) =>
                        current.includes(student.id)
                          ? current.filter((id) => id !== student.id)
                          : [...current, student.id],
                      )
                    }
                    onNotify={notify}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="teacher-student-card-grid">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                selected={selected.includes(student.id)}
                onToggle={() =>
                  setSelected((current) =>
                    current.includes(student.id)
                      ? current.filter((id) => id !== student.id)
                      : [...current, student.id],
                  )
                }
                onNotify={notify}
              />
            ))}
          </div>
        )}
        {!loading && !filteredStudents.length && (
          <div className="teacher-student-empty">
            <strong>No students match these filters.</strong>
            <p>Try changing the search or filter selections.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function StudentAvatar({ student }: { student: StudentRow }) {
  return (
    <span className={`teacher-student-avatar avatar-${student.studentId.slice(-1)}`}>
      {student.studentId.slice(0, 2).toUpperCase()}
    </span>
  );
}
function StudentRow({
  student,
  selected,
  onToggle,
  onNotify,
}: {
  student: StudentRow;
  selected: boolean;
  onToggle: () => void;
  onNotify: (message: string) => void;
}) {
  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${student.name}`}
        />
      </td>
      <td>
        <div className="teacher-student-identity">
          <StudentAvatar student={student} />
          <div>
            <strong>{student.name}</strong>
            <small>ID: #{student.studentId}</small>
          </div>
        </div>
      </td>
      <td>
        <strong>{student.courseName}</strong>
        <small>Enrollment record</small>
      </td>
      <td>
        <Progress value={student.attendance} suffix={`${student.absences} abs`} />
      </td>
      <td>
        <div className="teacher-student-mastery">
          <strong>—</strong>
          <small>Not available</small>
        </div>
      </td>
      <td>
        <strong>{student.lastSeen}</strong>
        <small>Attendance data</small>
      </td>
      <td>
        <span className={`teacher-student-tag ${student.status}`}>{student.tag}</span>
      </td>
      <td>
        <StudentActions student={student} onNotify={onNotify} />
      </td>
    </tr>
  );
}
function StudentCard({
  student,
  selected,
  onToggle,
  onNotify,
}: {
  student: StudentRow;
  selected: boolean;
  onToggle: () => void;
  onNotify: (message: string) => void;
}) {
  return (
    <article className="teacher-student-card">
      <div className="teacher-student-card-heading">
        <label>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            aria-label={`Select ${student.name}`}
          />
          <StudentAvatar student={student} />
        </label>
        <div>
          <strong>{student.name}</strong>
          <small>
            {student.studentId} · {student.courseName}
          </small>
        </div>
      </div>
      <div className="teacher-student-card-stats">
        <div>
          <span>Attendance</span>
          <b>{student.attendance}%</b>
        </div>
        <div>
          <span>Mastery</span>
          <b>—</b>
        </div>
        <div>
          <span>Last seen</span>
          <b>{student.lastSeen}</b>
        </div>
      </div>
      <span className={`teacher-student-tag ${student.status}`}>{student.tag}</span>
      <StudentActions student={student} onNotify={onNotify} />
    </article>
  );
}
function Progress({ value, suffix }: { value: number; suffix: string }) {
  return (
    <div className="teacher-student-progress">
      <div>
        <strong>{value}%</strong>
        <small>{suffix}</small>
      </div>
      <span>
        <i style={{ width: `${value}%` }} />
      </span>
    </div>
  );
}
function StudentActions({
  student,
  onNotify,
}: {
  student: StudentRow;
  onNotify: (message: string) => void;
}) {
  return (
    <div className="teacher-student-actions-cell">
      <button
        type="button"
        onClick={() => onNotify(`Reminder for ${student.name} is not available yet.`)}
      >
        Remind
      </button>
      <button
        type="button"
        aria-label={`Message ${student.name}`}
        onClick={() => onNotify("Messaging is not available yet.")}
      >
        ✉
      </button>
      <button
        type="button"
        aria-label={`View ${student.name} profile`}
        onClick={() => onNotify("Student profile details are not available yet.")}
      >
        ↗
      </button>
    </div>
  );
}

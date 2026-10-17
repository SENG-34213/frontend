"use client";

import { useMemo, useState } from "react";

type AttendanceStatus = "present" | "late" | "absent" | "excused";

type StudentAttendance = {
  id: string;
  name: string;
  initials: string;
  course: string;
  status: AttendanceStatus;
  timeIn: string;
  rate: number;
  absences: number;
  note: string;
  flagged?: boolean;
};

const initialStudents: StudentAttendance[] = [
  {
    id: "MNT-8902",
    name: "Alex Turner",
    initials: "AT",
    course: "AP Calculus BC · Sec 01",
    status: "late",
    timeIn: "10:42 AM",
    rate: 91,
    absences: 2,
    note: "",
  },
  {
    id: "MNT-7411",
    name: "Maya Patel",
    initials: "MP",
    course: "AP Calculus BC · Sec 01",
    status: "absent",
    timeIn: "-",
    rate: 78,
    absences: 5,
    note: "Chronic absence review",
    flagged: true,
  },
  {
    id: "MNT-4318",
    name: "David Kim",
    initials: "DK",
    course: "AP Calculus BC · Sec 01",
    status: "present",
    timeIn: "10:28 AM",
    rate: 96,
    absences: 1,
    note: "",
  },
  {
    id: "MNT-2819",
    name: "Marcus Brody",
    initials: "MB",
    course: "AP Calculus BC · Sec 01",
    status: "excused",
    timeIn: "-",
    rate: 94,
    absences: 1,
    note: "Dental surgery note",
  },
  {
    id: "MNT-5022",
    name: "Elena Rostova",
    initials: "ER",
    course: "AP Calculus BC · Sec 01",
    status: "present",
    timeIn: "10:29 AM",
    rate: 98,
    absences: 0,
    note: "",
  },
  {
    id: "MNT-6164",
    name: "Jordan Lee",
    initials: "JL",
    course: "Linear Algebra · Sec 02",
    status: "present",
    timeIn: "10:31 AM",
    rate: 100,
    absences: 0,
    note: "Perfect attendance",
  },
  {
    id: "MNT-3907",
    name: "Priya Shah",
    initials: "PS",
    course: "Linear Algebra · Sec 02",
    status: "late",
    timeIn: "10:46 AM",
    rate: 89,
    absences: 3,
    note: "",
  },
];

const statusLabels: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late / Tardy",
  absent: "Absent - Unexcused",
  excused: "Absent - Excused",
};

export default function TeacherAttendanceManagement() {
  const [students, setStudents] = useState(initialStudents);
  const [course, setCourse] = useState("AP Calculus BC · Sec 01");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const courses = [
    "All enrolled courses",
    ...new Set(initialStudents.map((student) => student.course)),
  ];
  const visibleStudents = useMemo(
    () =>
      students.filter((student) => {
        const search = query.trim().toLowerCase();
        const matchesCourse = course === "All enrolled courses" || student.course === course;
        const matchesStatus =
          statusFilter === "All statuses" || statusLabels[student.status] === statusFilter;
        const matchesQuery =
          !search ||
          `${student.name} ${student.id} ${student.course}`.toLowerCase().includes(search);
        return matchesCourse && matchesStatus && matchesQuery;
      }),
    [course, query, statusFilter, students],
  );

  const presentCount = students.filter(
    (student) => student.status === "present" || student.status === "late",
  ).length;
  const attendanceRate = Math.round((presentCount / students.length) * 1000) / 10;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function updateStatus(id: string, status: AttendanceStatus) {
    setStudents((current) =>
      current.map((student) =>
        student.id === id
          ? {
              ...student,
              status,
              timeIn: status === "present" ? "10:30 AM" : status === "late" ? "10:42 AM" : "-",
            }
          : student,
      ),
    );
    notify("Attendance status updated and saved locally.");
  }

  function markAllPresent() {
    setStudents((current) =>
      current.map((student) => ({ ...student, status: "present", timeIn: "10:30 AM" })),
    );
    notify("All visible students marked present.");
  }

  function markSelected(status: AttendanceStatus) {
    setStudents((current) =>
      current.map((student) =>
        selected.includes(student.id)
          ? { ...student, status, timeIn: status === "present" ? "10:30 AM" : "-" }
          : student,
      ),
    );
    setSelected([]);
    notify(`${statusLabels[status]} applied to selected students.`);
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
            <span>Term Q2 2024-2025</span>
          </div>
          <p>Track daily attendance, review absence patterns, and keep student records current.</p>
        </div>
        <div className="teacher-attendance-heading-actions">
          <button type="button" onClick={markAllPresent}>
            Mark All Present
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => notify("Attendance session created for the selected course.")}
          >
            Take Attendance
          </button>
        </div>
      </div>

      <div className="teacher-attendance-stats">
        <article>
          <small>PRESENT TODAY</small>
          <strong>
            {presentCount}
            <i>/ {students.length}</i>
          </strong>
          <span className="good">{attendanceRate}%</span>
          <p>2 tardy · 1 unexcused absent</p>
          <div className="teacher-attendance-bar">
            <span style={{ width: `${attendanceRate}%` }} />
          </div>
        </article>
        <article>
          <small>CHRONIC ABSENTEEISM RISK</small>
          <strong className="danger">
            4 <i>students</i>
          </strong>
          <span className="risk">Action trigger</span>
          <p>Students below the 85% term rate</p>
          <div className="teacher-attendance-bar danger-bar">
            <span style={{ width: "32%" }} />
          </div>
        </article>
        <article>
          <small>WEEKLY TREND</small>
          <strong>+2.4%</strong>
          <span className="good">Improving</span>
          <p>Compared with the previous five weeks</p>
          <div className="teacher-attendance-sparkline">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </article>
      </div>

      <div className="teacher-attendance-toolbar">
        <label className="teacher-attendance-search">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search students or IDs..."
            aria-label="Search students"
          />
        </label>
        <select
          value={course}
          onChange={(event) => setCourse(event.target.value)}
          aria-label="Filter by course"
        >
          {courses.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by attendance status"
        >
          <option>All statuses</option>
          {Object.values(statusLabels).map((label) => (
            <option key={label}>{label}</option>
          ))}
        </select>
        <button type="button" onClick={() => notify("Attendance records exported.")}>
          Export CSV
        </button>
        {selected.length > 0 && (
          <>
            <button type="button" onClick={() => markSelected("present")}>
              Mark selected present
            </button>
            <button type="button" onClick={() => markSelected("absent")}>
              Mark selected absent
            </button>
          </>
        )}
      </div>

      <div className="teacher-attendance-table-wrap">
        <div className="teacher-attendance-table-scroll">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      visibleStudents.length > 0 && selected.length === visibleStudents.length
                    }
                    onChange={(event) =>
                      setSelected(
                        event.target.checked ? visibleStudents.map((student) => student.id) : [],
                      )
                    }
                    aria-label="Select all visible students"
                  />
                </th>
                <th>Student &amp; ID</th>
                <th>Course section</th>
                <th>Today&apos;s status</th>
                <th>Time in</th>
                <th>Term rate</th>
                <th>Absences</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((student) => (
                <tr className={student.flagged ? "flagged" : ""} key={student.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(student.id)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, student.id]
                            : current.filter((id) => id !== student.id),
                        )
                      }
                      aria-label={`Select ${student.name}`}
                    />
                  </td>
                  <td>
                    <div className="teacher-attendance-student">
                      <span>{student.initials}</span>
                      <div>
                        <strong>
                          {student.name}
                          {student.flagged && <em>Flagged</em>}
                        </strong>
                        <small>#{student.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <b className="teacher-attendance-course-pill">{student.course}</b>
                  </td>
                  <td>
                    <div className="teacher-attendance-status-buttons">
                      {(["present", "late", "absent", "excused"] as AttendanceStatus[]).map(
                        (status) => (
                          <button
                            type="button"
                            key={status}
                            className={`${status} ${student.status === status ? "selected" : ""}`}
                            onClick={() => updateStatus(student.id, status)}
                            title={statusLabels[status]}
                          >
                            {status.charAt(0).toUpperCase()}
                          </button>
                        ),
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={student.status === "late" ? "late-text" : ""}>
                      {student.timeIn}
                    </span>
                  </td>
                  <td>
                    <div className="teacher-attendance-rate">
                      <b>{student.rate}%</b>
                      <span>
                        <i style={{ width: `${student.rate}%` }} />
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`teacher-attendance-absence-count ${student.absences >= 4 ? "high" : ""}`}
                    >
                      {student.absences}
                    </span>
                  </td>
                  <td>
                    <input
                      className="teacher-attendance-note"
                      defaultValue={student.note}
                      onBlur={(event) =>
                        setStudents((current) =>
                          current.map((item) =>
                            item.id === student.id ? { ...item, note: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Add note..."
                      aria-label={`Note for ${student.name}`}
                    />
                  </td>
                  <td>
                    <div className="teacher-attendance-row-actions">
                      <button
                        type="button"
                        onClick={() => notify(`Message opened for ${student.name}.`)}
                      >
                        Message
                      </button>
                      <button
                        type="button"
                        onClick={() => notify(`Attendance history opened for ${student.name}.`)}
                      >
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleStudents.length && (
            <div className="teacher-attendance-empty">No students match the selected filters.</div>
          )}
        </div>
        <div className="teacher-attendance-table-footer">
          <span>
            Showing {visibleStudents.length} of {students.length} scholars · Auto-saved locally
          </span>
          <div>
            <button type="button" disabled>
              Previous
            </button>
            <b>1</b>
            <button type="button">2</button>
            <button type="button">Next</button>
          </div>
        </div>
      </div>

      <div className="teacher-attendance-insights">
        <section>
          <div className="teacher-attendance-section-heading">
            <h3>AI Longitudinal Attendance Insights</h3>
            <span>Active copilot</span>
          </div>
          <div className="teacher-attendance-insight-grid">
            <article>
              <strong>Friday first-period dip</strong>
              <p>
                Attendance decreases by 8.4% on Fridays for Physics Honors. Six scholars regularly
                miss early lab work.
              </p>
              <button type="button" onClick={() => notify("Schedule Lab Shift action selected.")}>
                Schedule Lab Shift
              </button>
            </article>
            <article className="alert">
              <strong>Test-day correlation</strong>
              <p>
                Maya Patel and two others show a 91% correlation of unexcused absences on scheduled
                exam dates.
              </p>
              <button type="button" onClick={() => notify("Counselor referral action selected.")}>
                Refer to Counselor
              </button>
            </article>
          </div>
          <div className="teacher-attendance-trend">
            <div>
              <strong>Weekly attendance rhythm</strong>
              <span>Mon: 97.8% · Wed: 98.2% · Fri: 89.6%</span>
            </div>
            <div className="teacher-attendance-trend-bars">
              {[94, 92, 96, 95, 98].map((height, index) => (
                <span
                  key={index}
                  className={index === 4 ? "current" : ""}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </section>
        <section className="teacher-attendance-compliance">
          <div className="teacher-attendance-section-heading">
            <h3>Institutional Compliance</h3>
            <span className="compliant" />
          </div>
          <div>
            <p>
              <strong>District SIS automated sync</strong>
              <b>98.5% compliant</b>
            </p>
            <p>
              <strong>Canvas LMS LTI 1.3</strong>
              <small>All live records reconciled at 08:00 AM and 10:00 AM daily.</small>
            </p>
            <p>
              <strong>State attendance audit</strong>
              <small>Zero unverified absences exceeding the 72h window.</small>
            </p>
          </div>
          <button type="button" onClick={() => notify("Dean and admin report generation started.")}>
            Generate Dean / Admin Report
          </button>
          <small>Certified electronic signature of Dr. Sarah Lin</small>
        </section>
      </div>
    </section>
  );
}

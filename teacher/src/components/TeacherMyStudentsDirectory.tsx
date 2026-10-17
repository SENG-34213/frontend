"use client";

import { useMemo, useState } from "react";
import type { TeacherCourse } from "../lib/teacherApi";

type StudentStatus = "honors" | "on-track" | "support";
type StudentView = "table" | "cards";

type Student = {
  id: string;
  name: string;
  email: string;
  courseIndex: number;
  grade: string;
  attendance: number;
  absences: number;
  mastery: number;
  lastSeen: string;
  lastActivity: string;
  tag: string;
  status: StudentStatus;
};

const roster: Student[] = [
  {
    id: "MNT-8902",
    name: "Alex Turner",
    email: "alex.t@oakdale.edu",
    courseIndex: 0,
    grade: "Grade 12",
    attendance: 88,
    absences: 3,
    mastery: 78.4,
    lastSeen: "2 hours ago",
    lastActivity: "Derivatives Quiz 4",
    tag: "2 Missed Quizzes",
    status: "support",
  },
  {
    id: "MNT-8914",
    name: "Maya Patel",
    email: "maya.p@oakdale.edu",
    courseIndex: 0,
    grade: "Grade 12",
    attendance: 94,
    absences: 1,
    mastery: 84.2,
    lastSeen: "Yesterday",
    lastActivity: "Related Rates Lab",
    tag: "Score trending down",
    status: "support",
  },
  {
    id: "MNT-8871",
    name: "Jordan Lee",
    email: "jordan.l@oakdale.edu",
    courseIndex: 1,
    grade: "Grade 11",
    attendance: 98,
    absences: 0,
    mastery: 96.8,
    lastSeen: "Today, 9:18 AM",
    lastActivity: "Energy Systems Practice",
    tag: "Top performer",
    status: "honors",
  },
  {
    id: "MNT-8845",
    name: "Samira Khan",
    email: "samira.k@oakdale.edu",
    courseIndex: 1,
    grade: "Grade 11",
    attendance: 92,
    absences: 1,
    mastery: 89.5,
    lastSeen: "Today, 8:42 AM",
    lastActivity: "Momentum Check-in",
    tag: "On track",
    status: "on-track",
  },
  {
    id: "MNT-8926",
    name: "Chris Morgan",
    email: "chris.m@oakdale.edu",
    courseIndex: 2,
    grade: "Grade 12",
    attendance: 87,
    absences: 4,
    mastery: 82.1,
    lastSeen: "2 days ago",
    lastActivity: "Matrix Applications",
    tag: "Needs check-in",
    status: "on-track",
  },
  {
    id: "MNT-8864",
    name: "Elena Rodriguez",
    email: "elena.r@oakdale.edu",
    courseIndex: 2,
    grade: "Grade 12",
    attendance: 99,
    absences: 0,
    mastery: 98.1,
    lastSeen: "Today, 10:03 AM",
    lastActivity: "Linear Algebra Review",
    tag: "Top performer",
    status: "honors",
  },
  {
    id: "MNT-8933",
    name: "Noah Williams",
    email: "noah.w@oakdale.edu",
    courseIndex: 0,
    grade: "Grade 12",
    attendance: 76,
    absences: 6,
    mastery: 71.6,
    lastSeen: "4 days ago",
    lastActivity: "Unit 3 Assessment",
    tag: "Attendance watch",
    status: "support",
  },
  {
    id: "MNT-8850",
    name: "Priya Shah",
    email: "priya.s@oakdale.edu",
    courseIndex: 1,
    grade: "Grade 11",
    attendance: 96,
    absences: 0,
    mastery: 91.7,
    lastSeen: "Today, 7:56 AM",
    lastActivity: "Lab Reflection",
    tag: "On track",
    status: "on-track",
  },
];

export default function TeacherMyStudentsDirectory({ courses }: { courses: TeacherCourse[] }) {
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<"low" | "high">("low");
  const [view, setView] = useState<StudentView>("table");
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const courseOptions = useMemo(
    () =>
      Array.from(
        new Set(roster.map((student) => courses[student.courseIndex]?.id).filter(Boolean)),
      ),
    [courses],
  );
  const filteredStudents = useMemo(() => {
    const search = query.trim().toLowerCase();
    return [...roster]
      .filter((student) => {
        const courseId = courses[student.courseIndex]?.id;
        const matchesSearch =
          !search ||
          [student.name, student.email, student.id, student.lastActivity].some((value) =>
            value.toLowerCase().includes(search),
          );
        const matchesCourse = courseFilter === "all" || courseId === courseFilter;
        const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter;
        const matchesStatus = statusFilter === "all" || student.status === statusFilter;
        return matchesSearch && matchesCourse && matchesGrade && matchesStatus;
      })
      .sort((a, b) => (sort === "low" ? a.mastery - b.mastery : b.mastery - a.mastery));
  }, [courseFilter, courses, gradeFilter, query, sort, statusFilter]);

  const selectedVisible = filteredStudents.filter((student) => selected.includes(student.id));

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function toggleSelected(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleVisible() {
    const visibleIds = filteredStudents.map((student) => student.id);
    const allSelected = visibleIds.every((id) => selected.includes(id));
    setSelected((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  }

  function courseName(student: Student) {
    return (
      courses[student.courseIndex]?.courseName ||
      ["AP Calculus BC", "Physics Honors", "Linear Algebra"][student.courseIndex] ||
      "Assigned course"
    );
  }

  return (
    <section className="teacher-my-students" aria-labelledby="my-students-title">
      {notice && (
        <div className="teacher-my-students-notice" role="status">
          {notice}
        </div>
      )}
      <div className="teacher-my-students-heading">
        <div>
          <div className="teacher-my-students-eyebrow">
            <span>Spring semester · 2025</span>
            <i />
            <span className="teacher-my-students-live-dot" />
            <span>6 cohort sections active</span>
          </div>
          <h2 id="my-students-title">My Students</h2>
          <p>Directory of active scholars across your assigned courses and learning cohorts.</p>
        </div>
        <div className="teacher-my-students-actions">
          <button type="button" onClick={() => notify("Cohort announcement composer opened.")}>
            Send Cohort Announcement
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => notify("Student enrollment is coming soon.")}
          >
            + Enroll New Student
          </button>
        </div>
      </div>

      <div className="teacher-student-kpis">
        <article>
          <div>
            <span>Total Students</span>
            <b>148</b>
          </div>
          <small>Across 6 active cohorts</small>
          <em>+8.4% this semester</em>
        </article>
        <article>
          <div>
            <span>Avg. Course Mastery</span>
            <b>86.4%</b>
          </div>
          <small>Across all assessments</small>
          <em className="positive">+3.2% vs. last month</em>
        </article>
        <article>
          <div>
            <span>Needing Intervention</span>
            <b className="danger">6</b>
          </div>
          <small>Score drop &gt; 10% or &lt;75%</small>
          <button type="button" onClick={() => setStatusFilter("support")}>
            Review List →
          </button>
        </article>
        <article>
          <div>
            <span>Pending Submissions</span>
            <b>14</b>
          </div>
          <small>Items awaiting grade</small>
          <em>3 extension requests</em>
        </article>
      </div>

      <div className="teacher-student-briefing">
        <span className="teacher-student-briefing-icon">✦</span>
        <div>
          <strong>AI Roster Briefing for Today</strong>
          <p>
            3 students showed significant improvement this week. Maya Patel and Alex Turner are
            eligible for proactive diagnostic checks.
          </p>
        </div>
        <div className="teacher-student-briefing-actions">
          <button type="button" onClick={() => notify("Briefing dismissed for today.")}>
            Dismiss
          </button>
          <button type="button" className="primary" onClick={() => setStatusFilter("support")}>
            Apply Interventions →
          </button>
        </div>
      </div>

      <div className="teacher-student-toolbar">
        <div className="teacher-student-filter-group">
          <label className="teacher-student-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search student by name, ID, email..."
              aria-label="Search students"
            />
          </label>
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            aria-label="Filter by course"
          >
            <option value="all">Course: All Sections ({courseOptions.length || 6})</option>
            {courseOptions.map((id) => (
              <option key={id} value={id}>
                {courses.find((course) => course.id === id)?.courseName}
              </option>
            ))}
          </select>
          <select
            value={gradeFilter}
            onChange={(event) => setGradeFilter(event.target.value)}
            aria-label="Filter by grade"
          >
            <option value="all">Grade Level: All</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by academic status"
          >
            <option value="all">Status: All (148)</option>
            <option value="honors">Honors (&gt;90%)</option>
            <option value="on-track">On Track (75–89%)</option>
            <option value="support">Needs Support (&lt;75%)</option>
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
              <option value="low">Performance (Low to High)</option>
              <option value="high">Performance (High to Low)</option>
            </select>
          </label>
          <div className="teacher-student-view-toggle">
            <button
              type="button"
              className={view === "table" ? "active" : ""}
              onClick={() => setView("table")}
            >
              ☷ <span>Table</span>
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
        {view === "table" ? (
          <div className="teacher-student-table-wrap">
            <table className="teacher-student-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Scholar Name &amp; ID</th>
                  <th>Cohort &amp; Section</th>
                  <th>Grade Level</th>
                  <th>Attendance</th>
                  <th>Course Mastery</th>
                  <th>Last Seen</th>
                  <th>Academic Tag</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    selected={selected.includes(student.id)}
                    courseName={courseName(student)}
                    onToggle={() => toggleSelected(student.id)}
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
                courseName={courseName(student)}
                onToggle={() => toggleSelected(student.id)}
                onNotify={notify}
              />
            ))}
          </div>
        )}
        {!filteredStudents.length && (
          <div className="teacher-student-empty">
            <strong>No students match these filters.</strong>
            <p>Try changing the search or filter selections.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function StudentAvatar({ student }: { student: Student }) {
  return (
    <span className={`teacher-student-avatar avatar-${student.id.slice(-1)}`}>
      {student.name
        .split(" ")
        .map((part) => part[0])
        .join("")}
    </span>
  );
}

function StudentRow({
  student,
  selected,
  courseName,
  onToggle,
  onNotify,
}: {
  student: Student;
  selected: boolean;
  courseName: string;
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
            <small>
              ID: #{student.id} · {student.email}
            </small>
          </div>
        </div>
      </td>
      <td>
        <strong>{courseName}</strong>
        <small>Section {student.courseIndex % 2 ? "B" : "A"} · Teacher cohort</small>
      </td>
      <td>
        <span className="teacher-student-grade">{student.grade}</span>
      </td>
      <td>
        <Progress value={student.attendance} suffix={`${student.absences} abs`} />
      </td>
      <td>
        <div className={`teacher-student-mastery ${student.status}`}>
          <strong>{student.mastery}%</strong>
          <small>
            {student.mastery >= 90 ? "A" : student.mastery >= 80 ? "B" : "C+"} ·{" "}
            {student.mastery < 80 ? "↓" : "↑"}
          </small>
        </div>
      </td>
      <td>
        <strong>{student.lastSeen}</strong>
        <small>{student.lastActivity}</small>
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
  courseName,
  onToggle,
  onNotify,
}: {
  student: Student;
  selected: boolean;
  courseName: string;
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
            {student.id} · {courseName}
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
          <b>{student.mastery}%</b>
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
  student: Student;
  onNotify: (message: string) => void;
}) {
  return (
    <div className="teacher-student-actions-cell">
      <button type="button" onClick={() => onNotify(`Reminder sent to ${student.name}.`)}>
        Remind
      </button>
      <button
        type="button"
        aria-label={`Message ${student.name}`}
        onClick={() => onNotify(`Message composer opened for ${student.name}.`)}
      >
        ✉
      </button>
      <button
        type="button"
        aria-label={`View ${student.name} profile`}
        onClick={() => onNotify(`${student.name}'s detailed profile opened.`)}
      >
        ↗
      </button>
    </div>
  );
}

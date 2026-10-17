"use client";

import { useMemo, useState } from "react";

type AssignmentStatus = "Needs grading" | "Active" | "Closed";

type Assignment = {
  id: string;
  course: string;
  title: string;
  kind: string;
  status: AssignmentStatus;
  due: string;
  submitted: number;
  enrolled: number;
  graded: number;
  average: string;
  accent: "primary" | "secondary" | "muted";
  note: string;
};

const assignments: Assignment[] = [
  {
    id: "calculus-problem-set",
    course: "AP Calculus BC",
    title: "Problem Set 4.4: Related Rates & Optimization",
    kind: "Problem Set",
    status: "Needs grading",
    due: "Due today",
    submitted: 29,
    enrolled: 32,
    graded: 15,
    average: "86.4%",
    accent: "primary",
    note: "3 students have not submitted",
  },
  {
    id: "physics-lab",
    course: "Physics Honors",
    title: "Lab Report: Conservation of Momentum",
    kind: "Lab Report",
    status: "Needs grading",
    due: "Due Oct 28",
    submitted: 22,
    enrolled: 28,
    graded: 16,
    average: "89.1%",
    accent: "secondary",
    note: "6 submissions are in progress",
  },
  {
    id: "python-notebook",
    course: "Intro to Python",
    title: "Jupyter Notebook: Data Cleaning with Pandas",
    kind: "Practical Exercise",
    status: "Closed",
    due: "Closed yesterday",
    submitted: 26,
    enrolled: 26,
    graded: 26,
    average: "94.2%",
    accent: "muted",
    note: "Grades synced to the SIS gradebook",
  },
  {
    id: "linear-algebra",
    course: "Linear Algebra",
    title: "Proofs: Vector Spaces & Spanning Sets",
    kind: "Theoretical Proof",
    status: "Active",
    due: "Due Nov 8",
    submitted: 4,
    enrolled: 18,
    graded: 0,
    average: "—",
    accent: "muted",
    note: "14 students have viewed the prompt",
  },
];

const queue = [
  {
    initials: "AT",
    name: "Alex Turner",
    detail: "AP Calculus BC · PS 4.4",
    time: "2h ago",
    tag: "Needs partial credit",
  },
  {
    initials: "MP",
    name: "Maya Patel",
    detail: "Physics Honors · Lab 3",
    time: "5h ago",
    tag: "Ready for rubric scoring",
  },
  {
    initials: "DK",
    name: "David Kim",
    detail: "Intro to Python · Pandas NB",
    time: "Yesterday",
    tag: "Resubmitted with late pass",
  },
];

const statusFilters: Array<"All" | AssignmentStatus> = ["All", "Needs grading", "Active", "Closed"];

export default function TeacherAssignmentSubmissions() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("Needs grading");
  const [course, setCourse] = useState("All courses");
  const [notice, setNotice] = useState("");

  const courses = useMemo(
    () => ["All courses", ...new Set(assignments.map((assignment) => assignment.course))],
    [],
  );
  const filteredAssignments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return assignments.filter((assignment) => {
      const matchesStatus = status === "All" || assignment.status === status;
      const matchesCourse = course === "All courses" || assignment.course === course;
      const matchesQuery =
        !normalizedQuery ||
        [assignment.course, assignment.title, assignment.kind].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      return matchesStatus && matchesCourse && matchesQuery;
    });
  }, [course, query, status]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <section
      className="teacher-assignment-workspace"
      aria-labelledby="assignment-submissions-title"
    >
      {notice && (
        <div className="teacher-assignment-notice" role="status">
          {notice}
        </div>
      )}
      <div className="teacher-assignment-heading">
        <div>
          <div className="teacher-assignment-title-row">
            <h2 id="assignment-submissions-title">Assignments &amp; Submissions</h2>
            <span className="teacher-assignment-term">Term Q2 · Live</span>
          </div>
          <p>
            Manage coursework briefs, rubric configurations, student submissions, and grading
            pipelines.
          </p>
        </div>
        <div className="teacher-assignment-actions">
          <button
            type="button"
            className="teacher-assignment-secondary"
            onClick={() => showNotice("Gradebook export is being prepared.")}
          >
            ↓ Export Gradebook
          </button>
          <button
            type="button"
            className="teacher-assignment-primary"
            onClick={() =>
              showNotice(
                "Assignment creation will be available when the assessment API is connected.",
              )
            }
          >
            ＋ Create Assignment
          </button>
        </div>
      </div>

      <div className="teacher-assignment-stats">
        <article>
          <span className="teacher-assignment-stat-icon">!</span>
          <small>TO REVIEW</small>
          <strong>24</strong>
          <em>Submissions awaiting grading</em>
        </article>
        <article>
          <span className="teacher-assignment-stat-icon violet">◷</span>
          <small>ACTIVE ASSIGNMENTS</small>
          <strong>8</strong>
          <em>Across 4 courses</em>
        </article>
        <article>
          <span className="teacher-assignment-stat-icon green">↗</span>
          <small>AVG. SCORE</small>
          <strong>88.6%</strong>
          <em className="positive">+3.1% vs. last month</em>
        </article>
      </div>

      <div className="teacher-assignment-toolbar">
        <label className="teacher-assignment-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search assignments, courses, or rubrics..."
            aria-label="Search assignments"
          />
        </label>
        <div className="teacher-assignment-filters" aria-label="Assignment status filters">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={status === filter ? "active" : ""}
              onClick={() => setStatus(filter)}
            >
              {filter}
              {filter === "Needs grading" && <b>24</b>}
            </button>
          ))}
          <select
            value={course}
            onChange={(event) => setCourse(event.target.value)}
            aria-label="Filter by course"
          >
            {courses.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="teacher-assignment-grid">
        <div className="teacher-assignment-list">
          {filteredAssignments.length ? (
            filteredAssignments.map((assignment) => {
              const coverage = Math.round((assignment.submitted / assignment.enrolled) * 100);
              const grading = Math.round((assignment.graded / assignment.submitted) * 100);
              return (
                <article className="teacher-assignment-card" key={assignment.id}>
                  <span className={`teacher-assignment-accent ${assignment.accent}`} />
                  <div className="teacher-assignment-card-head">
                    <div>
                      <div className="teacher-assignment-meta">
                        <span>{assignment.course}</span>
                        <small>{assignment.due}</small>
                        <small>· {assignment.kind}</small>
                      </div>
                      <h3>{assignment.title}</h3>
                    </div>
                    <strong
                      className={`teacher-assignment-badge ${assignment.status.toLowerCase().replace(" ", "-")}`}
                    >
                      {assignment.status}
                    </strong>
                  </div>
                  <div className="teacher-assignment-metrics">
                    <div>
                      <div>
                        <span>Submission coverage</span>
                        <b>
                          {assignment.submitted} / {assignment.enrolled} <i>({coverage}%)</i>
                        </b>
                      </div>
                      <div className="teacher-assignment-progress">
                        <span style={{ width: `${coverage}%` }} />
                      </div>
                    </div>
                    <div>
                      <div>
                        <span>
                          {assignment.status === "Closed" ? "Cohort average" : "Grading pipeline"}
                        </span>
                        <b>
                          {assignment.status === "Closed"
                            ? assignment.average
                            : `${assignment.graded} graded · ${assignment.submitted - assignment.graded} in queue`}
                        </b>
                      </div>
                      <div className="teacher-assignment-progress">
                        <span
                          className={assignment.status === "Closed" ? "green" : "secondary"}
                          style={{
                            width: `${assignment.status === "Closed" ? assignment.average.replace("%", "") : grading}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="teacher-assignment-card-footer">
                    <span>◈ {assignment.note}</span>
                    <div>
                      <button
                        type="button"
                        onClick={() => showNotice(`Opening submissions for ${assignment.title}.`)}
                      >
                        Submissions
                      </button>
                      {assignment.status !== "Closed" && (
                        <button
                          type="button"
                          className="teacher-assignment-open"
                          onClick={() =>
                            showNotice(
                              `SpeedGrader opened for ${assignment.submitted - assignment.graded} submissions.`,
                            )
                          }
                        >
                          Open SpeedGrader ({assignment.submitted - assignment.graded})
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="teacher-assignment-empty">No assignments match these filters.</div>
          )}
        </div>

        <aside className="teacher-assignment-side">
          <section className="teacher-assignment-queue">
            <div className="teacher-assignment-side-heading">
              <div>
                <span className="teacher-assignment-side-icon">ϟ</span>
                <h3>SpeedGrader Queue</h3>
              </div>
              <b>24 urgent</b>
            </div>
            <p>Individual submissions flagged for teacher review or partial-credit evaluation.</p>
            <div className="teacher-assignment-ai">
              <strong>✦ AI Feedback Assistant</strong>
              <p>Synthesize constructive, rubric-aligned feedback across the active queue.</p>
              <button
                type="button"
                onClick={() =>
                  showNotice("AI Feedback Assistant is ready for the connected assessment service.")
                }
              >
                Launch AI Feedback Assistant →
              </button>
            </div>
            <small className="teacher-assignment-label">PRIORITY QUEUE</small>
            <div className="teacher-assignment-queue-list">
              {queue.map((student) => (
                <button
                  type="button"
                  key={student.name}
                  onClick={() => showNotice(`Opening ${student.name}'s submission.`)}
                >
                  <span className="teacher-assignment-avatar">{student.initials}</span>
                  <span>
                    <strong>{student.name}</strong>
                    <small>{student.detail}</small>
                    <em>{student.tag}</em>
                  </span>
                  <time>{student.time}</time>
                  <b>→</b>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="teacher-assignment-view-queue"
              onClick={() => setStatus("Needs grading")}
            >
              View all 24 in queue →
            </button>
          </section>
          <section className="teacher-assignment-velocity">
            <div className="teacher-assignment-side-heading">
              <h3>Grade Velocity</h3>
              <span>⌁</span>
            </div>
            <p>Current quarter score spread across all 76 enrolled students.</p>
            <div className="teacher-assignment-bars">
              {[
                [15, "&lt;70%"],
                [35, "70–79"],
                [70, "80–89"],
                [95, "90–100"],
              ].map(([height, label], index) => (
                <div key={label as string}>
                  <span className={`bar-${index}`} style={{ height: `${height}%` }} />
                  <small>{label}</small>
                </div>
              ))}
            </div>
            <div className="teacher-assignment-velocity-foot">
              <span>Class mean: 88.6%</span>
              <span>+2.4% vs Q1</span>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

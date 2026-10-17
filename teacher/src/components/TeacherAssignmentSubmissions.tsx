"use client";

import { useEffect, useMemo, useState } from "react";
import type { TeacherAssignment, TeacherCourse, TeacherSubmission } from "../lib/teacherApi";
import { teacherApi } from "../lib/teacherApi";

type AssignmentView = TeacherAssignment & { courseName: string; submissions: TeacherSubmission[] };
type Props = { courses: TeacherCourse[] };
const statusFilters = ["All", "Needs grading", "Active", "Closed"] as const;
type Filter = (typeof statusFilters)[number];

function formatDate(value?: string) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}
function shortId(value: string) {
  return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}
function viewStatus(assignment: AssignmentView): Exclude<Filter, "All"> {
  if (assignment.submissions.some((item) => ["SUBMITTED", "UNDER_REVIEW"].includes(item.status)))
    return "Needs grading";
  return assignment.status === "CLOSED" ? "Closed" : "Active";
}

export default function TeacherAssignmentSubmissions({ courses }: Props) {
  const [assignments, setAssignments] = useState<AssignmentView[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Filter>("Needs grading");
  const [course, setCourse] = useState("All courses");
  const [selected, setSelected] = useState<AssignmentView | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<TeacherSubmission | null>(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const grouped = await Promise.all(
          courses.map(async (teacherCourse) => {
            const courseAssignments = await teacherApi.assignments(teacherCourse.id);
            return Promise.all(
              courseAssignments.map(async (assignment) => ({
                ...assignment,
                courseName: teacherCourse.courseName,
                submissions: await teacherApi.assignmentSubmissions(assignment.id),
              })),
            );
          }),
        );
        if (!cancelled) setAssignments(grouped.flat());
      } catch (loadError) {
        if (!cancelled) {
          setAssignments([]);
          setError(loadError instanceof Error ? loadError.message : "Unable to load assignments.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [courses]);

  const courseOptions = useMemo(
    () => ["All courses", ...new Set(assignments.map((item) => item.courseName))],
    [assignments],
  );
  const filteredAssignments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return assignments.filter((assignment) => {
      const matchesStatus = status === "All" || viewStatus(assignment) === status;
      const matchesCourse = course === "All courses" || assignment.courseName === course;
      const matchesQuery =
        !normalized ||
        `${assignment.courseName} ${assignment.title}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesCourse && matchesQuery;
    });
  }, [assignments, course, query, status]);
  const allSubmissions = assignments.flatMap((item) => item.submissions);
  const awaiting = allSubmissions.filter((item) =>
    ["SUBMITTED", "UNDER_REVIEW"].includes(item.status),
  );
  const graded = allSubmissions.filter((item) => item.marks !== undefined && item.marks !== null);
  const average = graded.length
    ? graded.reduce((sum, item) => sum + Number(item.marks), 0) / graded.length
    : 0;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }
  function openAssignment(assignment: AssignmentView) {
    setSelected(assignment);
    setSelectedSubmission(assignment.submissions[0] || null);
    if (assignment.submissions[0]) selectSubmission(assignment.submissions[0]);
  }
  function selectSubmission(submission: TeacherSubmission) {
    setSelectedSubmission(submission);
    setMarks(submission.marks == null ? "" : String(submission.marks));
    setFeedback(submission.feedback || "");
  }
  function updateSubmission(updated: TeacherSubmission) {
    setSelectedSubmission(updated);
    setAssignments((current) =>
      current.map((assignment) => ({
        ...assignment,
        submissions: assignment.submissions.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      })),
    );
    setSelected((current) =>
      current
        ? {
            ...current,
            submissions: current.submissions.map((item) =>
              item.id === updated.id ? updated : item,
            ),
          }
        : current,
    );
  }
  async function saveGrade() {
    if (!selectedSubmission) return;
    const numericMarks = Number(marks);
    if (!Number.isFinite(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      showNotice("Enter a mark between 0 and 100.");
      return;
    }
    setSaving(true);
    try {
      updateSubmission(
        await teacherApi.gradeSubmission(selectedSubmission.id, {
          marks: numericMarks,
          feedback: feedback.trim() || undefined,
        }),
      );
      showNotice("Grade saved.");
    } catch (saveError) {
      showNotice(saveError instanceof Error ? saveError.message : "Unable to save the grade.");
    } finally {
      setSaving(false);
    }
  }
  async function returnSubmission() {
    if (!selectedSubmission) return;
    setSaving(true);
    try {
      updateSubmission(await teacherApi.returnSubmission(selectedSubmission.id));
      showNotice("Submission returned to the student.");
    } catch (returnError) {
      showNotice(
        returnError instanceof Error ? returnError.message : "Unable to return the submission.",
      );
    } finally {
      setSaving(false);
    }
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
            <span className="teacher-assignment-term">Live data</span>
          </div>
          <p>
            Review student work, grade submissions, and return feedback from your assigned courses.
          </p>
        </div>
        <div className="teacher-assignment-actions">
          <button
            type="button"
            className="teacher-assignment-secondary"
            onClick={() => showNotice("Gradebook export is not available yet.")}
          >
            ↓ Export Gradebook
          </button>
          <button
            type="button"
            className="teacher-assignment-primary"
            onClick={() => showNotice("Create assignment is not available in this workspace yet.")}
          >
            ＋ Create Assignment
          </button>
        </div>
      </div>
      <div className="teacher-assignment-stats">
        <article>
          <span className="teacher-assignment-stat-icon">!</span>
          <small>TO REVIEW</small>
          <strong>{awaiting.length}</strong>
          <em>Submissions awaiting grading</em>
        </article>
        <article>
          <span className="teacher-assignment-stat-icon violet">◷</span>
          <small>ACTIVE ASSIGNMENTS</small>
          <strong>{assignments.filter((item) => item.status !== "CLOSED").length}</strong>
          <em>Across {courses.length} courses</em>
        </article>
        <article>
          <span className="teacher-assignment-stat-icon green">↗</span>
          <small>AVG. SCORE</small>
          <strong>{graded.length ? `${average.toFixed(1)}%` : "—"}</strong>
          <em>From graded submissions</em>
        </article>
      </div>
      <div className="teacher-assignment-toolbar">
        <label className="teacher-assignment-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search assignments or courses..."
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
              {filter === "Needs grading" && <b>{awaiting.length}</b>}
            </button>
          ))}
          <select
            value={course}
            onChange={(event) => setCourse(event.target.value)}
            aria-label="Filter by course"
          >
            {courseOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      {loading && (
        <div className="teacher-assignment-empty">Loading assignments and submissions…</div>
      )}
      {!loading && error && <div className="teacher-assignment-empty">{error}</div>}
      {!loading && !error && !courses.length && (
        <div className="teacher-assignment-empty">
          No courses are assigned to your teacher account yet.
        </div>
      )}
      {!loading && !error && courses.length > 0 && (
        <div className="teacher-assignment-grid">
          <div className="teacher-assignment-list">
            {filteredAssignments.length ? (
              filteredAssignments.map((assignment) => {
                const assignmentStatus = viewStatus(assignment);
                const submitted = assignment.submissions.filter(
                  (item) => item.status !== "DRAFT",
                ).length;
                const gradedCount = assignment.submissions.filter(
                  (item) => item.marks != null,
                ).length;
                const coverage =
                  courses.find((item) => item.courseName === assignment.courseName)
                    ?.numberOfStudents || submitted;
                const percentage = coverage
                  ? Math.min(100, Math.round((submitted / coverage) * 100))
                  : 0;
                return (
                  <article className="teacher-assignment-card" key={assignment.id}>
                    <span
                      className={`teacher-assignment-accent ${assignmentStatus === "Needs grading" ? "primary" : assignmentStatus === "Active" ? "secondary" : "muted"}`}
                    />
                    <div className="teacher-assignment-card-head">
                      <div>
                        <div className="teacher-assignment-meta">
                          <span>{assignment.courseName}</span>
                          <small>{formatDate(assignment.dueDate)}</small>
                          <small>· Assignment</small>
                        </div>
                        <h3>{assignment.title}</h3>
                      </div>
                      <strong
                        className={`teacher-assignment-badge ${assignmentStatus.toLowerCase().replace(" ", "-")}`}
                      >
                        {assignmentStatus}
                      </strong>
                    </div>
                    <div className="teacher-assignment-metrics">
                      <div>
                        <div>
                          <span>Submission coverage</span>
                          <b>
                            {submitted}
                            {coverage ? ` / ${coverage}` : ""} <i>({percentage}%)</i>
                          </b>
                        </div>
                        <div className="teacher-assignment-progress">
                          <span style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                      <div>
                        <div>
                          <span>Grading pipeline</span>
                          <b>
                            {gradedCount} graded · {Math.max(0, submitted - gradedCount)} in queue
                          </b>
                        </div>
                        <div className="teacher-assignment-progress">
                          <span
                            className="secondary"
                            style={{
                              width: `${submitted ? Math.round((gradedCount / submitted) * 100) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="teacher-assignment-card-footer">
                      <span>
                        ◈{" "}
                        {assignment.maxMarks
                          ? `${assignment.maxMarks} marks`
                          : "Review submissions"}
                      </span>
                      <div>
                        <button type="button" onClick={() => openAssignment(assignment)}>
                          Submissions ({assignment.submissions.length})
                        </button>
                        {assignment.submissions.length > gradedCount && (
                          <button
                            type="button"
                            className="teacher-assignment-open"
                            onClick={() => openAssignment(assignment)}
                          >
                            Open SpeedGrader ({assignment.submissions.length - gradedCount})
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
            {selected ? (
              <section className="teacher-assignment-queue">
                <div className="teacher-assignment-side-heading">
                  <h3>Submission Review</h3>
                  <button type="button" onClick={() => setSelected(null)}>
                    Close
                  </button>
                </div>
                <p>{selected.title}</p>
                <div className="teacher-assignment-queue-list">
                  {selected.submissions.length ? (
                    selected.submissions.map((submission) => (
                      <button
                        type="button"
                        key={submission.id}
                        onClick={() => selectSubmission(submission)}
                      >
                        <span className="teacher-assignment-avatar">
                          {shortId(submission.studentId).slice(0, 2).toUpperCase()}
                        </span>
                        <span>
                          <strong>{shortId(submission.studentId)}</strong>
                          <small>
                            {submission.status}
                            {submission.isLate ? " · Late" : ""}
                          </small>
                          <em>
                            {submission.marks == null
                              ? "Needs grading"
                              : `${submission.marks} marks`}
                          </em>
                        </span>
                        <b>→</b>
                      </button>
                    ))
                  ) : (
                    <span>No submissions yet.</span>
                  )}
                </div>
                {selectedSubmission && (
                  <div className="teacher-assignment-review-form">
                    <label>
                      Marks
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={marks}
                        onChange={(event) => setMarks(event.target.value)}
                      />
                    </label>
                    <label>
                      Feedback
                      <textarea
                        value={feedback}
                        onChange={(event) => setFeedback(event.target.value)}
                        rows={4}
                      />
                    </label>
                    <button type="button" disabled={saving} onClick={saveGrade}>
                      {saving ? "Saving…" : "Save grade"}
                    </button>
                    <button
                      type="button"
                      disabled={saving || selectedSubmission.marks == null}
                      onClick={returnSubmission}
                    >
                      Return to student
                    </button>
                  </div>
                )}
              </section>
            ) : (
              <section className="teacher-assignment-queue">
                <h3>Submission Review</h3>
                <p>Select an assignment to review its submissions and grading status.</p>
              </section>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import TeacherQuizWorkspace from "./TeacherQuizWorkspace";
import { teacherApi, type TeacherCourse, type TeacherQuiz } from "../lib/teacherApi";

type AssessmentCategory = "all" | "unit" | "weekly" | "diagnostic" | "exit";
type AssessmentView = "table" | "cards";

type AssessmentRow = {
  id: string;
  title: string;
  code: string;
  category: Exclude<AssessmentCategory, "all">;
  courseIndex: number;
  structure: string;
  duration: string;
  submissions: string;
  score: string;
  status: "graded" | "live" | "scheduled" | "draft";
};

const previewAssessments: AssessmentRow[] = [
  {
    id: "preview-c4",
    title: "Unit 4 Checkpoint: Implicit & Related Rates",
    code: "MATH-402—C4",
    category: "unit",
    courseIndex: 0,
    structure: "15 Items (10 MCQ, 5 FRQ)",
    duration: "45 Mins",
    submissions: "31 / 32",
    score: "86.4%",
    status: "graded",
  },
  {
    id: "preview-physics",
    title: "Newton's Second Law Dynamics Exam",
    code: "PHYS-301—E2",
    category: "unit",
    courseIndex: 1,
    structure: "20 Questions (Standard)",
    duration: "60 Mins",
    submissions: "28 / 28",
    score: "81.2%",
    status: "graded",
  },
  {
    id: "preview-linear",
    title: "Eigenvalues & Diagonalization Pop Quiz",
    code: "MATH-305—Q3",
    category: "weekly",
    courseIndex: 2,
    structure: "5 Questions (Interactive)",
    duration: "15 Mins",
    submissions: "19 / 24 active",
    score: "79%",
    status: "live",
  },
  {
    id: "preview-midterm",
    title: "Unit 3 Integration Techniques Midterm",
    code: "MATH-402—M1",
    category: "diagnostic",
    courseIndex: 0,
    structure: "25 Questions",
    duration: "90 Mins",
    submissions: "Locked",
    score: "—",
    status: "scheduled",
  },
  {
    id: "preview-python",
    title: "Pandas DataFrame Querying Test",
    code: "CS-105—AI",
    category: "exit",
    courseIndex: 3,
    structure: "10 Code Challenge Items",
    duration: "40 Mins",
    submissions: "Unpublished",
    score: "—",
    status: "draft",
  },
];

function quizToRow(quiz: TeacherQuiz, index: number): AssessmentRow {
  return {
    id: quiz.id,
    title: quiz.title,
    code: `ASSESS-${String(index + 1).padStart(2, "0")}`,
    category: index % 3 === 0 ? "unit" : index % 3 === 1 ? "weekly" : "diagnostic",
    courseIndex: index,
    structure: `${quiz.questions?.length || 0} Questions`,
    duration: `${quiz.durationMinutes} Mins`,
    submissions: quiz.status === "PUBLISHED" ? "Ready to review" : "Draft",
    score: quiz.status === "PUBLISHED" ? "—" : "—",
    status: quiz.status === "PUBLISHED" ? "scheduled" : "draft",
  };
}

export default function TeacherQuizzesAssessments({ courses }: { courses: TeacherCourse[] }) {
  const [quizzes, setQuizzes] = useState<TeacherQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AssessmentCategory>("all");
  const [courseId, setCourseId] = useState("all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<AssessmentView>("table");
  const [showEditor, setShowEditor] = useState(false);
  const [notice, setNotice] = useState("");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!courses.length) return;
    let cancelled = false;
    teacherApi
      .quizzes()
      .then((items) => {
        if (!cancelled) setQuizzes(items);
      })
      .catch(() => {
        if (!cancelled) setQuizzes([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courses.length]);

  const assessments = useMemo(
    () => (quizzes.length ? quizzes.map(quizToRow) : previewAssessments),
    [quizzes],
  );
  const filteredAssessments = useMemo(() => {
    const search = query.trim().toLowerCase();
    return assessments.filter((assessment) => {
      const matchesSearch =
        !search || `${assessment.title} ${assessment.code}`.toLowerCase().includes(search);
      const matchesCategory = category === "all" || assessment.category === category;
      const matchesCourse = courseId === "all" || courses[assessment.courseIndex]?.id === courseId;
      const matchesStatus = status === "all" || assessment.status === status;
      return matchesSearch && matchesCategory && matchesCourse && matchesStatus;
    });
  }, [assessments, category, courseId, courses, query, status]);
  const showLoading = loading && courses.length > 0;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  if (showEditor) {
    return (
      <section className="teacher-quizzes-editor-shell">
        <button type="button" className="teacher-quizzes-back" onClick={() => setShowEditor(false)}>
          ← Back to assessment overview
        </button>
        <TeacherQuizWorkspace courses={courses} />
      </section>
    );
  }

  return (
    <section className="teacher-quizzes" aria-labelledby="teacher-quizzes-title">
      {notice && (
        <div className="teacher-quizzes-notice" role="status">
          {notice}
        </div>
      )}
      <div className="teacher-quizzes-heading">
        <div>
          <span className="teacher-quizzes-kicker">Evaluation &amp; Mastery</span>
          <h2 id="teacher-quizzes-title">Quizzes &amp; Assessments</h2>
          <p>
            Create, distribute, and analyze standardized tests, unit checkpoints, and AI-assisted
            rubric evaluations across your STEM cohorts.
          </p>
        </div>
        <div className="teacher-quizzes-actions">
          <button type="button" className="ai" onClick={() => setShowEditor(true)}>
            ✦ AI Quiz Generator <span>Instant Draft</span>
          </button>
          <button type="button" onClick={() => setShowEditor(true)}>
            ⊕ New Assessment
          </button>
          <button
            type="button"
            aria-label="Assessment settings"
            onClick={() => notify("Assessment view settings opened.")}
          >
            ☷
          </button>
        </div>
      </div>

      <div className="teacher-quizzes-kpis">
        <article>
          <div>
            <span>Active Assessments</span>
            <b>28</b>
            <small>cohort wide</small>
          </div>
          <strong>◉ 6 Live &nbsp; · &nbsp; 14 Quizzes &nbsp; · &nbsp; 8 Midterms</strong>
        </article>
        <article>
          <div>
            <span>Term Mean Score</span>
            <b>84.6%</b>
            <em>↗ 3.2%</em>
          </div>
          <strong className="kpi-chart">〰〰 Top 10% benchmark</strong>
        </article>
        <article>
          <div>
            <span>Pending Free Response</span>
            <b className="danger">18</b>
            <small>submissions</small>
          </div>
          <strong>
            2 tests awaiting review{" "}
            <button type="button" onClick={() => notify("Free response grading queue opened.")}>
              Grade Now →
            </button>
          </strong>
        </article>
        <article>
          <div>
            <span>AI Generated Checkpoints</span>
            <b className="blue">12</b>
            <small>this month</small>
          </div>
          <strong>● 8.4 hrs grading saved with AI rubrics</strong>
        </article>
      </div>

      <div className="teacher-quizzes-ai-panel">
        <div className="teacher-quizzes-ai-heading">
          <span>✦</span>
          <div>
            <strong>Mentify AI Assessment Generator</strong>
            <small>GPT-4o STEM Fine-tuned</small>
            <p>
              Provide a syllabus objective or topic prompt to assemble questions with step-by-step
              mark schemes.
            </p>
          </div>
          <button type="button" onClick={() => notify("Fine-tune options opened.")}>
            Fine-tune options⌄
          </button>
        </div>
        <div className="teacher-quizzes-ai-form">
          <span>♧</span>
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Generate a 5-question AP Calculus differential calculus quiz with detailed step-by-step..."
          />
          <select aria-label="AI assessment difficulty">
            <option>AP / Rigorous</option>
            <option>Standard</option>
            <option>Foundational</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setShowEditor(true);
              notify("AI quiz builder opened with your prompt.");
            }}
          >
            ϟ Quick Generate
          </button>
        </div>
      </div>

      <div className="teacher-quizzes-filter-panel">
        <div className="teacher-quizzes-tabs" role="tablist">
          {(["all", "unit", "weekly", "diagnostic", "exit"] as const).map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item === "all"
                ? "All"
                : item === "unit"
                  ? "Unit Exams"
                  : item === "weekly"
                    ? "Weekly Quizzes"
                    : item === "diagnostic"
                      ? "Diagnostic Checkpoints"
                      : "Exit Tickets"}{" "}
              <b>
                {item === "all"
                  ? 28
                  : item === "unit"
                    ? 6
                    : item === "weekly"
                      ? 14
                      : item === "diagnostic"
                        ? 5
                        : 3}
              </b>
            </button>
          ))}
        </div>
        <div className="teacher-quizzes-filter-row">
          <label className="teacher-quizzes-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by quiz title, course, or topic tag..."
              aria-label="Search assessments"
            />
          </label>
          <select
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            aria-label="Filter by course"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">Status: All States</option>
            <option value="graded">AI Graded</option>
            <option value="live">Live</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
          </select>
          <div className="teacher-quizzes-view-toggle">
            <button
              type="button"
              className={view === "table" ? "active" : ""}
              onClick={() => setView("table")}
            >
              ☷
            </button>
            <button
              type="button"
              className={view === "cards" ? "active" : ""}
              onClick={() => setView("cards")}
            >
              ▦
            </button>
          </div>
        </div>
        <div className="teacher-quizzes-bulk-row">
          <span>
            Showing {filteredAssessments.length} of {assessments.length} evaluations
          </span>
          <div>
            <button type="button" onClick={() => notify("Assessment CSV export prepared.")}>
              ⇩ Export CSV
            </button>
            <button type="button" onClick={() => notify("Bulk publish queue opened.")}>
              ⇧ Bulk Publish
            </button>
          </div>
        </div>
      </div>

      <div className="teacher-assessment-list">
        {showLoading && (
          <div className="teacher-quizzes-loading">Loading connected assessments…</div>
        )}
        {!showLoading &&
          filteredAssessments.length > 0 &&
          (view === "table" ? (
            <AssessmentTable
              assessments={filteredAssessments}
              courses={courses}
              onNotify={notify}
            />
          ) : (
            <AssessmentCards
              assessments={filteredAssessments}
              courses={courses}
              onNotify={notify}
            />
          ))}
        {!showLoading && !filteredAssessments.length && (
          <div className="teacher-quizzes-empty">
            <strong>No assessments match these filters.</strong>
            <p>Try a different search or clear one of the filters.</p>
          </div>
        )}
        <div className="teacher-quizzes-footer">
          Showing 1 to {Math.min(filteredAssessments.length, 5)} of {assessments.length} assessments
          across {Math.max(courses.length, 4)} enrolled subjects{" "}
          <span>
            ‹ &nbsp; <b>1</b> &nbsp; 2 &nbsp; 3 &nbsp; … &nbsp; 6 &nbsp; ›
          </span>
        </div>
      </div>

      <div className="teacher-quizzes-insights">
        <Insight
          title="Common Student Misconception"
          text="In Unit 4 Checkpoint, 42% of students confused dx/dt sign conventions in conical tank drain problems."
          action="Generate Drill →"
          onClick={() => notify("Targeted drill draft opened.")}
        />
        <Insight
          title="Automated Rubric Matching"
          text="All 18 pending Free Response submissions have had initial partial-credit rubric suggestions generated by Mentify AI."
          action="Accept & Finalize →"
          onClick={() => notify("Rubric suggestions opened.")}
        />
        <Insight
          title="CollegeBoard Standards Sync"
          text="Your current term assessments map to 89% of AP Exam Big Ideas. Next recommended focus: Integration by Parts."
          action="Curriculum Map →"
          onClick={() => notify("Curriculum standards map opened.")}
        />
      </div>
    </section>
  );
}

function courseLabel(courses: TeacherCourse[], assessment: AssessmentRow) {
  return (
    courses[assessment.courseIndex]?.courseName ||
    ["AP Calculus BC", "Physics Honors", "Linear Algebra", "Python Data Science"][
      assessment.courseIndex
    ] ||
    "Assigned Course"
  );
}

function AssessmentTable({
  assessments,
  courses,
  onNotify,
}: {
  assessments: AssessmentRow[];
  courses: TeacherCourse[];
  onNotify: (message: string) => void;
}) {
  return (
    <div className="teacher-quizzes-table-wrap">
      <table className="teacher-quizzes-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Assessment Title &amp; ID</th>
            <th>Course &amp; Cohort</th>
            <th>Structure</th>
            <th>Submissions</th>
            <th>Mean Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((assessment) => (
            <tr key={assessment.id}>
              <td>
                <input type="checkbox" aria-label={`Select ${assessment.title}`} />
              </td>
              <td>
                <div className="teacher-assessment-title">
                  <span className={`teacher-assessment-type ${assessment.category}`}>
                    {assessment.category === "unit"
                      ? "EXM"
                      : assessment.category === "weekly"
                        ? "QUIZ"
                        : assessment.category === "diagnostic"
                          ? "MID"
                          : "FRQ"}
                  </span>
                  <div>
                    <strong>{assessment.title}</strong>
                    <small>
                      {assessment.code} &nbsp; · &nbsp; {assessment.structure} &nbsp; · &nbsp;{" "}
                      {assessment.status === "live"
                        ? "Session ends in 22 min"
                        : assessment.status === "draft"
                          ? "Draft auto-saved 1h ago"
                          : "Due Today, 11:59 PM"}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <strong>{courseLabel(courses, assessment)}</strong>
                <small>
                  Section 01 · {courses[assessment.courseIndex]?.numberOfStudents || 32} Students
                </small>
              </td>
              <td>
                <span className="teacher-assessment-structure">
                  {assessment.category === "unit"
                    ? "Mixed"
                    : assessment.category === "weekly"
                      ? "Speed Check"
                      : "Full Midterm"}
                </span>
                <small>{assessment.duration}</small>
              </td>
              <td>
                <strong className={assessment.status === "live" ? "live-text" : ""}>
                  {assessment.submissions}
                </strong>
              </td>
              <td>
                <strong className={assessment.score === "—" ? "muted-text" : "score-text"}>
                  {assessment.score}
                </strong>
                <small>{assessment.score !== "—" ? "B+" : ""}</small>
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => onNotify(`${assessment.title} actions opened.`)}
                >
                  •••
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssessmentCards({
  assessments,
  courses,
  onNotify,
}: {
  assessments: AssessmentRow[];
  courses: TeacherCourse[];
  onNotify: (message: string) => void;
}) {
  return (
    <div className="teacher-assessment-card-grid">
      {assessments.map((assessment) => (
        <article className="teacher-assessment-card" key={assessment.id}>
          <div>
            <span className={`teacher-assessment-type ${assessment.category}`}>
              {assessment.category.toUpperCase()}
            </span>
            <h3>{assessment.title}</h3>
            <small>
              {assessment.code} · {courseLabel(courses, assessment)}
            </small>
          </div>
          <div className="teacher-assessment-card-metrics">
            <span>
              Structure <b>{assessment.structure}</b>
            </span>
            <span>
              Submissions <b>{assessment.submissions}</b>
            </span>
            <span>
              Mean score <b>{assessment.score}</b>
            </span>
          </div>
          <button type="button" onClick={() => onNotify(`${assessment.title} actions opened.`)}>
            Open assessment →
          </button>
        </article>
      ))}
    </div>
  );
}

function Insight({
  title,
  text,
  action,
  onClick,
}: {
  title: string;
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <article className="teacher-quizzes-insight">
      <strong>✧ {title}</strong>
      <p>{text}</p>
      <button type="button" onClick={onClick}>
        {action}
      </button>
    </article>
  );
}

"use client";

import { useState } from "react";
import type { TeacherCourse } from "../lib/teacherApi";

type Lesson = {
  id: string;
  label: string;
  title: string;
  duration: string;
  done?: boolean;
  locked?: boolean;
};
type Module = {
  id: string;
  number: number;
  title: string;
  count: string;
  state: "done" | "active" | "upcoming";
  lessons: Lesson[];
};

const modules: Module[] = [
  {
    id: "limits",
    number: 1,
    title: "Limits & Continuity",
    count: "6 / 6 Done",
    state: "done",
    lessons: [],
  },
  {
    id: "differentiation",
    number: 2,
    title: "Differentiation: Fundamental Properties",
    count: "8 / 8 Done",
    state: "done",
    lessons: [],
  },
  {
    id: "composite",
    number: 3,
    title: "Composite, Implicit & Inverse Functions",
    count: "7 / 7 Done",
    state: "done",
    lessons: [],
  },
  {
    id: "contextual",
    number: 4,
    title: "Contextual Applications of Differentiation",
    count: "5 / 8 Done",
    state: "active",
    lessons: [
      {
        id: "straight-line",
        label: "4.1",
        title: "Straight-Line Motion & Rates",
        duration: "12 min",
        done: true,
      },
      {
        id: "position",
        label: "4.2",
        title: "Connecting Position, Velocity & Acceleration",
        duration: "18 min",
        done: true,
      },
      {
        id: "exponential",
        label: "4.3",
        title: "Exponential Models in Population",
        duration: "16 min",
        done: true,
      },
      {
        id: "related-rates",
        label: "4.4",
        title: "Related Rates in Physical Systems",
        duration: "55 min",
        done: true,
      },
      {
        id: "linear",
        label: "4.5",
        title: "Linear Approximation & Differential",
        duration: "21 min",
        locked: true,
      },
      {
        id: "lhopital",
        label: "4.6",
        title: "L'Hopital's Rule & Indeterminate Forms",
        duration: "24 min",
        locked: true,
      },
    ],
  },
  {
    id: "derivatives",
    number: 5,
    title: "Analytical Applications of Derivatives",
    count: "0 / 6 Done",
    state: "upcoming",
    lessons: [],
  },
];

const objectives = [
  {
    text: "Express rates of change with respect to time as derivatives (dx/dt, dv/dt).",
    meta: "AP Standard: CHA-3.D · Essential Knowledge 3.4A",
    complete: true,
  },
  {
    text: "Formulate equations relating given quantities using geometric formulas.",
    meta: "AP Standard: CHA-3.E · Model translation & constraints",
    complete: true,
  },
  {
    text: "Apply the chain rule implicitly to solve dynamic physical rate problems with correct units.",
    meta: "AP Standard: CHA-3.F · Differential application and unit fidelity",
    complete: false,
  },
];

export default function TeacherCourseDetailsCurriculum({
  courses,
  courseId,
}: {
  courses: TeacherCourse[];
  courseId?: string;
}) {
  const [activeLessonId, setActiveLessonId] = useState("related-rates");
  const [activeTab, setActiveTab] = useState("Curriculum & Lessons");
  const [completedObjectives, setCompletedObjectives] = useState(
    objectives.map((objective) => objective.complete),
  );
  const [notice, setNotice] = useState("");
  const course = courses.find((item) => item.id === courseId) || courses[0];
  const activeLesson =
    modules.flatMap((module) => module.lessons).find((lesson) => lesson.id === activeLessonId) ||
    modules[3].lessons[3];
  const completedCount = completedObjectives.filter(Boolean).length;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <section className="teacher-course-details" aria-labelledby="course-details-title">
      {notice && (
        <div className="teacher-course-notice" role="status">
          {notice}
        </div>
      )}
      <div className="teacher-course-hero">
        <div className="teacher-course-breadcrumb">
          <span>My Courses</span>
          <b>›</b>
          <strong>{course?.courseName || "AP Calculus BC"} (MATH-402)</strong>
        </div>
        <div className="teacher-course-hero-main">
          <div>
            <div className="teacher-course-badges">
              <span>Active cohort</span>
              <span>Grade 12</span>
              <span>Semester 1</span>
              <span>Room 304 &amp; Zoom live</span>
            </div>
            <h2 id="course-details-title">
              {course?.courseName || "AP Calculus BC"} - Advanced Differentiation &amp; Series
            </h2>
            <p>
              {course?.courseDescription ||
                "College Board curriculum alignment: differential calculus, transcendental functions, Taylor series approximations, and vector-valued velocity dynamics."}
            </p>
          </div>
          <div className="teacher-course-hero-actions">
            <button type="button" onClick={() => notify("AI Curriculum Assistant opened.")}>
              AI Curriculum Assistant
            </button>
            <button type="button" onClick={() => notify("Live session controls opened.")}>
              Start Live Session
            </button>
          </div>
        </div>
        <div className="teacher-course-stats">
          <div>
            <strong>{course?.numberOfStudents || 32}</strong>
            <small>Enrolled scholars</small>
          </div>
          <div>
            <strong>
              28 <i>/ 36</i>
            </strong>
            <small>Paced lessons</small>
          </div>
          <div>
            <strong>89.2%</strong>
            <small>Class mean grade</small>
          </div>
          <div>
            <strong>94%</strong>
            <small>Live attendance</small>
          </div>
        </div>
      </div>

      <nav className="teacher-course-tabs" aria-label="Course sections">
        {[
          "Overview",
          "Curriculum & Lessons",
          "Students & Roster",
          "Sessions & Live",
          "Materials & Files",
          "Quizzes & Tests",
          "Assignments",
        ].map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() =>
              tab === "Curriculum & Lessons"
                ? setActiveTab(tab)
                : notify(`${tab} is available from the course workspace.`)
            }
          >
            {tab}
            {tab === "Students & Roster" && <b>32</b>}
            {tab === "Materials & Files" && <b>45</b>}
            {tab === "Quizzes & Tests" && <b>12</b>}
          </button>
        ))}
      </nav>

      <div className="teacher-course-grid">
        <aside className="teacher-course-left-column">
          <section className="teacher-course-modules">
            <div className="teacher-course-section-title">
              <h3>Course Modules</h3>
              <span>5 Units</span>
              <em>78% Overall</em>
            </div>
            <div className="teacher-course-progress">
              <span style={{ width: "78%" }} />
            </div>
            <div className="teacher-course-module-list">
              {modules.map((module) => (
                <article className={`teacher-course-module ${module.state}`} key={module.id}>
                  <button
                    type="button"
                    onClick={() => module.lessons[0] && setActiveLessonId(module.lessons[0].id)}
                  >
                    <span className="teacher-course-module-check">
                      {module.state === "done" ? "✓" : module.state === "active" ? "◉" : "○"}
                    </span>
                    <span>
                      <small>
                        Module {module.number}
                        {module.state === "active" ? " · In progress" : ""}
                      </small>
                      <strong>{module.title}</strong>
                    </span>
                    <em>{module.count}</em>
                  </button>
                  {module.lessons.length > 0 && (
                    <div className="teacher-course-lesson-list">
                      {module.lessons.map((lesson) => (
                        <button
                          type="button"
                          className={lesson.id === activeLessonId ? "active" : ""}
                          key={lesson.id}
                          onClick={() => setActiveLessonId(lesson.id)}
                        >
                          <span>{lesson.label}</span>
                          <strong>{lesson.title}</strong>
                          <em>{lesson.done ? "✓" : lesson.locked ? "Lock" : lesson.duration}</em>
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
            <button
              type="button"
              className="teacher-course-add-module"
              onClick={() => notify("New module form opened.")}
            >
              + Add New Module
            </button>
          </section>
          <section className="teacher-course-resources">
            <div className="teacher-course-section-title">
              <h3>Pedagogical Resources</h3>
              <span>Book</span>
            </div>
            <p>
              Access the master textbook problem bank, past College Board free-response keys, and
              classroom links.
            </p>
            <div>
              <button type="button" onClick={() => notify("Formulas Sheet opened.")}>
                Formulas Sheet
              </button>
              <button type="button" onClick={() => notify("FRQ Archives opened.")}>
                FRQ Archives
              </button>
            </div>
          </section>
        </aside>

        <section className="teacher-course-lesson-detail">
          <div className="teacher-course-lesson-header">
            <div>
              <div className="teacher-course-lesson-meta">
                <span>Lesson {activeLesson.label}</span>
                <small>Scheduled for today, 10:30 AM</small>
              </div>
              <h3>{activeLesson.title}</h3>
              <p>
                Comprehensive problem solving with time-dependent differential equations, dynamic
                geometry rates, and multi-variable chain rule setups.
              </p>
            </div>
            <small>Estimated duration: {activeLesson.duration}</small>
          </div>
          <div className="teacher-course-ai-callout">
            <strong>Mentify AI Diagnostic Insight</strong>
            <p>
              Scholars encountered difficulty with Pythagorean substitution in last year&apos;s
              midterm quiz. Would you like to introduce a two-step visual scaffolding slide?
            </p>
            <button
              type="button"
              onClick={() => notify("Scaffolding slide inserted into the lesson draft.")}
            >
              Insert Scaffolding Slide
            </button>
          </div>
          <div className="teacher-course-objectives">
            <div className="teacher-course-section-title">
              <h3>Specific Learning Objectives</h3>
              <button type="button" onClick={() => notify("Objective added to this lesson.")}>
                + Add Objective
              </button>
            </div>
            {objectives.map((objective, index) => (
              <label key={objective.text}>
                <input
                  type="checkbox"
                  checked={completedObjectives[index]}
                  onChange={() =>
                    setCompletedObjectives((current) =>
                      current.map((value, itemIndex) => (itemIndex === index ? !value : value)),
                    )
                  }
                />
                <span>
                  <strong>
                    {index + 1}. {objective.text}
                  </strong>
                  <small>{objective.meta}</small>
                </span>
              </label>
            ))}
          </div>
          <div className="teacher-course-materials">
            <div className="teacher-course-section-title">
              <h3>Class Materials &amp; Media</h3>
              <button type="button" onClick={() => notify("Material picker opened.")}>
                + Attach Material
              </button>
            </div>
            <div className="teacher-course-material-grid">
              <button type="button" onClick={() => notify("Lecture notes preview opened.")}>
                <strong>PDF</strong>
                <span>Lecture_Notes_v4.pdf</span>
                <small>1.8 MB · Core Notes</small>
                <em>Preview</em>
              </button>
              <button type="button" onClick={() => notify("Interactive GeoGebra material opened.")}>
                <strong>3D</strong>
                <span>3D Conical Tank Model</span>
                <small>GeoGebra Interactive App</small>
                <em>Open Interactive</em>
              </button>
              <button type="button" onClick={() => notify("Problem set download started.")}>
                <strong>DOC</strong>
                <span>ProblemSet_4.4.pdf</span>
                <small>450 KB · 12 Problems</small>
                <em>Download</em>
              </button>
            </div>
          </div>
          <div className="teacher-course-exit-ticket">
            <div className="teacher-course-section-title">
              <h3>Integrated Checkpoint &amp; Exit Ticket</h3>
              <button type="button" onClick={() => notify("Exit ticket editor opened.")}>
                Edit Quiz
              </button>
            </div>
            <div>
              <strong>Exit Ticket: 3-Minute Quick Check on Implicit Chain Rule</strong>
              <span>Auto-graded</span>
              <p>
                3 Concept Questions · 5-min timer after Zoom completion · Live Analytics Enabled
              </p>
              <button type="button" onClick={() => notify("Exit ticket preview opened.")}>
                Preview Form
              </button>
            </div>
          </div>
          <div className="teacher-course-board">
            <div className="teacher-course-section-title">
              <h3>Annotated Visual Board Preview</h3>
              <span>Auto-syncs to Scholar iPads</span>
            </div>
            <div className="teacher-course-board-art">
              <span>The Problem</span>
              <b>Similar Triangles: r / h = R / H</b>
              <i>Solution: Related Rates</i>
              <small>Live Canvas Ready</small>
            </div>
          </div>
          <footer className="teacher-course-actions">
            <span>Cloud Draft autosaved 2 minutes ago</span>
            <div>
              <button type="button" onClick={() => notify("Lesson duplicated.")}>
                Duplicate Lesson
              </button>
              <button
                type="button"
                onClick={() => notify(`${completedCount} objectives saved to the lesson draft.`)}
              >
                Save Lesson Changes
              </button>
              <button
                type="button"
                className="publish"
                onClick={() => notify("Lesson published to the student portal.")}
              >
                Publish to Student Portal
              </button>
            </div>
          </footer>
        </section>
      </div>
    </section>
  );
}

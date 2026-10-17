"use client";

import { useEffect, useState } from "react";
import type { CourseLesson, CourseModule, TeacherCourse } from "../lib/teacherApi";
import { teacherApi } from "../lib/teacherApi";

const sessions = [
  {
    time: "09:00",
    title: "Warm-up: Rate of Change",
    detail: "5 min · Bell ringer",
    state: "Complete",
  },
  {
    time: "09:10",
    title: "Related Rates in Physical Systems",
    detail: "35 min · Core instruction",
    state: "In progress",
  },
  {
    time: "09:45",
    title: "Collaborative Problem Lab",
    detail: "20 min · Small groups",
    state: "Upcoming",
  },
  {
    time: "10:05",
    title: "Exit Ticket & Reflection",
    detail: "5 min · Auto-graded",
    state: "Upcoming",
  },
];

const resources = [
  { type: "PDF", title: "Lecture Notes v4.4", detail: "1.8 MB · Shared" },
  { type: "3D", title: "Conical Tank Model", detail: "GeoGebra · Live applet" },
  { type: "QUIZ", title: "Related Rates Checkpoint", detail: "3 questions · Draft" },
];

export default function TeacherMentifyStudio({ courses }: { courses: TeacherCourse[] }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<Record<string, CourseLesson[]>>({});
  const [activeLessonId, setActiveLessonId] = useState("");
  const [activeTab, setActiveTab] = useState("Lesson Studio");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeCourseId = courseId || courses[0]?.id || "";
  const activeCourse = courses.find((course) => course.id === activeCourseId);
  const allLessons = modules.flatMap((module) => lessons[module.id] || []);
  const activeLesson = allLessons.find((lesson) => lesson.id === activeLessonId) || allLessons[0];

  useEffect(() => {
    let cancelled = false;
    async function loadStudio() {
      if (!activeCourseId) {
        setModules([]);
        setLessons({});
        setActiveLessonId("");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const loadedModules = await teacherApi.modules(activeCourseId);
        const entries = await Promise.all(
          loadedModules.map(
            async (module) =>
              [module.id, await teacherApi.lessons(activeCourseId, module.id)] as const,
          ),
        );
        if (!cancelled) {
          const loadedLessons = Object.fromEntries(entries);
          const firstLesson = loadedModules.flatMap((module) => loadedLessons[module.id] || [])[0];
          setModules(loadedModules);
          setLessons(loadedLessons);
          setActiveLessonId(firstLesson?.id || "");
          setDraft(firstLesson?.description || "");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load Studio lessons.",
          );
          setModules([]);
          setLessons({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadStudio();
    return () => {
      cancelled = true;
    };
  }, [activeCourseId]);

  async function saveLesson() {
    if (!activeLesson || !activeCourseId) return;
    const targetModule = modules.find((item) =>
      (lessons[item.id] || []).some((lesson) => lesson.id === activeLesson.id),
    );
    if (!targetModule) return;
    setSaving(true);
    setError("");
    try {
      const updated = await teacherApi.updateLesson(
        activeCourseId,
        targetModule.id,
        activeLesson.id,
        {
          title: activeLesson.title,
          description: draft,
        },
      );
      setLessons((current) => ({
        ...current,
        [targetModule.id]: (current[targetModule.id] || []).map((lesson) =>
          lesson.id === updated.id ? updated : lesson,
        ),
      }));
      notify("Lesson draft saved to the course service.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the lesson.");
    } finally {
      setSaving(false);
    }
  }

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <section className="teacher-studio" aria-labelledby="mentify-studio-title">
      {notice && (
        <div className="teacher-studio-notice" role="status">
          {notice}
        </div>
      )}
      {error && (
        <div className="teacher-studio-notice" role="alert">
          {error}
        </div>
      )}
      <header className="teacher-studio-header">
        <div>
          <div className="teacher-studio-eyebrow">
            <span>Mentify Studio</span>
            <b /> Lesson co-pilot
          </div>
          <h2 id="mentify-studio-title">Build better learning moments.</h2>
          <p>Plan, refine, and launch an intelligent lesson workspace for your next class.</p>
        </div>
        <div className="teacher-studio-header-actions">
          <span className={published ? "studio-saved" : "studio-draft"}>
            {published ? "Published" : "Draft autosaved"}
          </span>
          <button type="button" onClick={() => notify("Studio preview opened.")}>
            Preview
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              setPublished(true);
              notify("Lesson published to the student portal.");
            }}
          >
            Publish lesson
          </button>
        </div>
      </header>

      <nav className="teacher-studio-tabs" aria-label="Mentify Studio workspace">
        {["Lesson Studio", "Session Planner", "Student Insights", "Template Library"].map((tab) => (
          <button
            type="button"
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() =>
              tab === "Lesson Studio"
                ? setActiveTab(tab)
                : notify(`${tab} will open when the Studio service is connected.`)
            }
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="teacher-studio-layout">
        <main className="teacher-studio-canvas">
          <div className="teacher-studio-canvas-heading">
            <div>
              <span className="teacher-studio-label">
                ACTIVE LESSON · {activeCourse?.courseName || "NO COURSE"}
              </span>
              <select
                value={activeCourseId}
                onChange={(event) => setCourseId(event.target.value)}
                aria-label="Select Studio course"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseName}
                  </option>
                ))}
              </select>
              <select
                value={activeLessonId}
                onChange={(event) => {
                  const next = allLessons.find((lesson) => lesson.id === event.target.value);
                  setActiveLessonId(event.target.value);
                  setDraft(next?.description || "");
                }}
                aria-label="Select Studio lesson"
                disabled={loading || !allLessons.length}
              >
                {!allLessons.length && (
                  <option value="">{loading ? "Loading lessons…" : "No lessons available"}</option>
                )}
                {allLessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
              <h3>{activeLesson?.title || "Select a lesson"}</h3>
              <p>
                {activeLesson?.description ||
                  "Select a real course lesson to begin editing in Studio."}
              </p>
            </div>
            <button type="button" onClick={() => notify("Lesson settings opened.")}>
              Settings
            </button>
          </div>
          <div className="teacher-studio-toolbar">
            <button type="button" className="selected">
              Content
            </button>
            <button type="button" onClick={() => notify("Activity blocks selected.")}>
              Activities
            </button>
            <button type="button" onClick={() => notify("Assessment blocks selected.")}>
              Assessment
            </button>
            <span />
            <button type="button" onClick={() => notify("Block inserted.")}>
              + Add block
            </button>
          </div>
          <section className="teacher-studio-editor-card">
            <div className="teacher-studio-editor-heading">
              <div>
                <span className="teacher-studio-block-number">01</span>
                <div>
                  <small>OPENING PROMPT</small>
                  <h4>Connect the quantities</h4>
                </div>
              </div>
              <button type="button" onClick={() => notify("Block options opened.")}>
                More
              </button>
            </div>
            <p>How quickly is the water level changing when the radius of the tank is 5 cm?</p>
            <div className="teacher-studio-callout">
              <strong>Teaching move</strong>
              <span>
                Ask students to identify the known quantities before introducing a derivative.
              </span>
            </div>
          </section>
          <section className="teacher-studio-editor-card active">
            <div className="teacher-studio-editor-heading">
              <div>
                <span className="teacher-studio-block-number">02</span>
                <div>
                  <small>CORE INSTRUCTION</small>
                  <h4>Learning objectives</h4>
                </div>
              </div>
              <span className="studio-block-status">AI refined</span>
            </div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="Learning objective draft"
            />
            <div className="teacher-studio-objective-row">
              <label>
                <input type="checkbox" defaultChecked /> Explain the relationship between variables.
              </label>
              <label>
                <input type="checkbox" defaultChecked /> Apply the chain rule with units.
              </label>
              <button type="button" onClick={() => notify("Objective added.")}>
                + Add objective
              </button>
            </div>
          </section>
          <section className="teacher-studio-editor-card">
            <div className="teacher-studio-editor-heading">
              <div>
                <span className="teacher-studio-block-number">03</span>
                <div>
                  <small>COLLABORATIVE PRACTICE</small>
                  <h4>Conical tank investigation</h4>
                </div>
              </div>
              <button type="button" onClick={() => notify("Activity editor opened.")}>
                Edit activity
              </button>
            </div>
            <div className="teacher-studio-activity">
              <span className="studio-activity-icon">3D</span>
              <div>
                <strong>Interactive GeoGebra simulation</strong>
                <p>Students manipulate the tank height and observe how the volume rate changes.</p>
              </div>
              <span className="studio-live-pill">Live applet</span>
            </div>
          </section>
          <section className="teacher-studio-editor-card">
            <div className="teacher-studio-editor-heading">
              <div>
                <span className="teacher-studio-block-number">04</span>
                <div>
                  <small>CHECK FOR UNDERSTANDING</small>
                  <h4>Exit ticket</h4>
                </div>
              </div>
              <button type="button" onClick={() => notify("Exit ticket preview opened.")}>
                Preview
              </button>
            </div>
            <div className="teacher-studio-quiz-row">
              <strong>Three-minute related rates checkpoint</strong>
              <span>3 questions</span>
              <b>Auto-graded</b>
            </div>
          </section>
        </main>

        <aside className="teacher-studio-rail">
          <section className="teacher-studio-copilot">
            <div className="teacher-studio-panel-heading">
              <div>
                <span className="studio-spark">AI</span>
                <h3>Studio Copilot</h3>
              </div>
              <button type="button" onClick={() => setCopilotOpen((current) => !current)}>
                {copilotOpen ? "Hide" : "Show"}
              </button>
            </div>
            {copilotOpen && (
              <>
                <p>Suggestions based on your course context and recent student performance.</p>
                <div className="teacher-studio-suggestion">
                  <small>Suggested improvement</small>
                  <strong>Add a visual scaffold before independent practice.</strong>
                  <button
                    type="button"
                    onClick={() => notify("Scaffolding block added to the lesson.")}
                  >
                    Insert suggestion
                  </button>
                </div>
                <div className="teacher-studio-suggestion">
                  <small>Student signal</small>
                  <strong>6 scholars struggled with unit conversion last session.</strong>
                  <button type="button" onClick={() => notify("Support prompt added.")}>
                    Add support prompt
                  </button>
                </div>
              </>
            )}
          </section>
          <section className="teacher-studio-session">
            <div className="teacher-studio-panel-heading">
              <div>
                <span className="studio-panel-icon">Today</span>
                <h3>Session timeline</h3>
              </div>
              <button type="button" onClick={() => notify("Session planner opened.")}>
                Edit
              </button>
            </div>
            <div className="teacher-studio-timeline">
              {sessions.map((session) => (
                <button
                  type="button"
                  key={session.time}
                  className={session.state === "In progress" ? "current" : ""}
                  onClick={() => notify(`${session.title} selected.`)}
                >
                  <time>{session.time}</time>
                  <span>
                    <strong>{session.title}</strong>
                    <small>{session.detail}</small>
                  </span>
                  <em>{session.state}</em>
                </button>
              ))}
            </div>
          </section>
          <section className="teacher-studio-resources">
            <div className="teacher-studio-panel-heading">
              <div>
                <span className="studio-panel-icon">Files</span>
                <h3>Attached resources</h3>
              </div>
              <button type="button" onClick={() => notify("Resource picker opened.")}>
                + Add
              </button>
            </div>
            <div>
              {resources.map((resource) => (
                <button
                  type="button"
                  key={resource.title}
                  onClick={() => notify(`${resource.title} selected.`)}
                >
                  <span>{resource.type}</span>
                  <strong>{resource.title}</strong>
                  <small>{resource.detail}</small>
                </button>
              ))}
            </div>
          </section>
          <section className="teacher-studio-readiness">
            <div className="teacher-studio-panel-heading">
              <h3>Launch readiness</h3>
              <b>82%</b>
            </div>
            <div className="teacher-studio-readiness-bar">
              <span style={{ width: "82%" }} />
            </div>
            <ul>
              <li className="done">Learning objectives added</li>
              <li className="done">Materials attached</li>
              <li>Student instructions need review</li>
              <li>Publish to student portal</li>
            </ul>
            <button type="button" onClick={() => notify("Readiness checklist opened.")}>
              Review checklist
            </button>
          </section>
        </aside>
      </div>
      <footer className="teacher-studio-footer">
        <span>Studio changes sync automatically</span>
        <div>
          <button type="button" onClick={() => notify("Lesson duplicated.")}>
            Duplicate lesson
          </button>
          <button
            type="button"
            onClick={() => void saveLesson()}
            disabled={saving || !activeLesson}
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              setPublished(true);
              notify("Lesson published to the student portal.");
            }}
          >
            Publish to student portal
          </button>
        </div>
      </footer>
    </section>
  );
}

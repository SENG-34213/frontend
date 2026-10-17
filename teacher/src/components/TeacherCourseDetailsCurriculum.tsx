"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { CourseLesson, CourseModule, TeacherCourse } from "../lib/teacherApi";
import { teacherApi } from "../lib/teacherApi";

type Props = { courses: TeacherCourse[]; courseId?: string };
function lessonLabel(module: CourseModule, index: number) {
  return `${module.sequenceOrder ?? 0}.${index + 1}`;
}

export default function TeacherCourseDetailsCurriculum({ courses, courseId }: Props) {
  const course = courses.find((item) => item.id === courseId) || courses[0];
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<Record<string, CourseLesson[]>>({});
  const [activeModuleId, setActiveModuleId] = useState("");
  const [activeLessonId, setActiveLessonId] = useState("");
  const [activeTab, setActiveTab] = useState("Curriculum & Lessons");
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadCurriculum() {
      if (!course?.id) {
        setModules([]);
        setLessons({});
        return;
      }
      setLoading(true);
      setError("");
      try {
        const loadedModules = await teacherApi.modules(course.id);
        const entries = await Promise.all(
          loadedModules.map(
            async (module) => [module.id, await teacherApi.lessons(course.id, module.id)] as const,
          ),
        );
        if (!cancelled) {
          const loadedLessons = Object.fromEntries(entries);
          setModules(loadedModules);
          setLessons(loadedLessons);
          const firstModule = loadedModules[0];
          const firstLesson = firstModule ? loadedLessons[firstModule.id]?.[0] : undefined;
          setActiveModuleId(firstModule?.id || "");
          setActiveLessonId(firstLesson?.id || "");
        }
      } catch (loadError) {
        if (!cancelled) {
          setModules([]);
          setLessons({});
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the course curriculum.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadCurriculum();
    return () => {
      cancelled = true;
    };
  }, [course?.id]);

  const activeModule = modules.find((module) => module.id === activeModuleId) || modules[0];
  const allLessons = useMemo(
    () =>
      modules.flatMap((module) =>
        (lessons[module.id] || []).map((lesson) => ({ ...lesson, moduleId: module.id })),
      ),
    [lessons, modules],
  );
  const activeLesson =
    allLessons.find((lesson) => lesson.id === activeLessonId) ||
    (activeModule
      ? {
          ...(lessons[activeModule.id]?.[0] || {
            id: "",
            title: "Select a lesson",
            description: "",
            isVisible: true,
          }),
          moduleId: activeModule.id,
        }
      : undefined);
  const totalLessons = allLessons.length;
  const visibleLessons = allLessons.filter((lesson) => lesson.isVisible !== false).length;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }
  async function createModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course?.id || !moduleTitle.trim()) return;
    setBusy(true);
    setError("");
    try {
      const created = await teacherApi.createModule(course.id, {
        title: moduleTitle.trim(),
        description: moduleDescription.trim(),
        sequenceOrder: modules.length + 1,
      });
      setModules((current) => [...current, created]);
      setLessons((current) => ({ ...current, [created.id]: [] }));
      setActiveModuleId(created.id);
      setModuleTitle("");
      setModuleDescription("");
      setShowModuleForm(false);
      notify("Module created.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create the module.");
    } finally {
      setBusy(false);
    }
  }
  async function createLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course?.id || !activeModule || !lessonTitle.trim()) return;
    setBusy(true);
    setError("");
    try {
      const created = await teacherApi.createLesson(course.id, activeModule.id, {
        title: lessonTitle.trim(),
        description: lessonDescription.trim(),
      });
      setLessons((current) => ({
        ...current,
        [activeModule.id]: [...(current[activeModule.id] || []), created],
      }));
      setActiveLessonId(created.id);
      setLessonTitle("");
      setLessonDescription("");
      setShowLessonForm(false);
      notify("Lesson created.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create the lesson.");
    } finally {
      setBusy(false);
    }
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
          <strong>{course?.courseName || "Course details"}</strong>
        </div>
        <div className="teacher-course-hero-main">
          <div>
            <div className="teacher-course-badges">
              <span>{course?.courseStatus || "Active course"}</span>
              <span>{course?.subject || "Curriculum"}</span>
              <span>{course?.numberOfStudents || 0} enrolled</span>
            </div>
            <h2 id="course-details-title">{course?.courseName || "Select a course"}</h2>
            <p>
              {course?.courseDescription ||
                "Build and manage the course curriculum, modules, and lessons."}
            </p>
          </div>
          <div className="teacher-course-hero-actions">
            <button
              type="button"
              onClick={() => notify("Curriculum assistant is not available yet.")}
            >
              AI Curriculum Assistant
            </button>
            <button type="button" onClick={() => notify("Live session controls opened.")}>
              Start Live Session
            </button>
          </div>
        </div>
        <div className="teacher-course-stats">
          <div>
            <strong>{course?.numberOfStudents || 0}</strong>
            <small>Enrolled scholars</small>
          </div>
          <div>
            <strong>
              {visibleLessons}
              <i> / {totalLessons}</i>
            </strong>
            <small>Visible lessons</small>
          </div>
          <div>
            <strong>{modules.length}</strong>
            <small>Course modules</small>
          </div>
          <div>
            <strong>
              {totalLessons ? `${Math.round((visibleLessons / totalLessons) * 100)}%` : "—"}
            </strong>
            <small>Curriculum visible</small>
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
            {tab === "Students & Roster" && <b>{course?.numberOfStudents || 0}</b>}
          </button>
        ))}
      </nav>
      {error && (
        <div className="teacher-course-notice" role="alert">
          {error}
        </div>
      )}
      {!course ? (
        <div className="teacher-state">Choose a course to manage its curriculum.</div>
      ) : (
        <div className="teacher-course-grid">
          <aside className="teacher-course-left-column">
            <section className="teacher-course-modules">
              <div className="teacher-course-section-title">
                <h3>Course Modules</h3>
                <span>{modules.length} Units</span>
                <em>
                  {totalLessons
                    ? `${Math.round((visibleLessons / totalLessons) * 100)}% Visible`
                    : "No lessons"}
                </em>
              </div>
              <div className="teacher-course-progress">
                <span
                  style={{ width: `${totalLessons ? (visibleLessons / totalLessons) * 100 : 0}%` }}
                />
              </div>
              {loading ? (
                <div className="teacher-state">Loading curriculum…</div>
              ) : (
                <div className="teacher-course-module-list">
                  {modules.map((module, index) => {
                    const moduleLessons = lessons[module.id] || [];
                    const visibleCount = moduleLessons.filter(
                      (lesson) => lesson.isVisible !== false,
                    ).length;
                    return (
                      <article
                        className={`teacher-course-module ${moduleLessons.length ? "active" : "upcoming"}`}
                        key={module.id}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModuleId(module.id);
                            setActiveLessonId(moduleLessons[0]?.id || "");
                          }}
                        >
                          <span className="teacher-course-module-check">
                            {moduleLessons.length ? "◉" : "○"}
                          </span>
                          <span>
                            <small>Module {module.sequenceOrder ?? index + 1}</small>
                            <strong>{module.title}</strong>
                          </span>
                          <em>
                            {visibleCount} / {moduleLessons.length} Visible
                          </em>
                        </button>
                        {moduleLessons.length > 0 && (
                          <div className="teacher-course-lesson-list">
                            {moduleLessons.map((lesson, lessonIndex) => (
                              <button
                                type="button"
                                className={lesson.id === activeLessonId ? "active" : ""}
                                key={lesson.id}
                                onClick={() => {
                                  setActiveModuleId(module.id);
                                  setActiveLessonId(lesson.id);
                                }}
                              >
                                <span>{lessonLabel(module, lessonIndex)}</span>
                                <strong>{lesson.title}</strong>
                                <em>{lesson.isVisible === false ? "Hidden" : "Visible"}</em>
                              </button>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                  {!modules.length && (
                    <div className="teacher-state">No modules yet. Add the first module below.</div>
                  )}
                </div>
              )}
              <button
                type="button"
                className="teacher-course-add-module"
                onClick={() => setShowModuleForm((current) => !current)}
              >
                + Add New Module
              </button>
              {showModuleForm && (
                <form
                  className="teacher-course-inline-form"
                  onSubmit={(event) => void createModule(event)}
                >
                  <input
                    required
                    value={moduleTitle}
                    onChange={(event) => setModuleTitle(event.target.value)}
                    placeholder="Module title"
                    aria-label="Module title"
                  />
                  <textarea
                    value={moduleDescription}
                    onChange={(event) => setModuleDescription(event.target.value)}
                    placeholder="Description (optional)"
                  />
                  <button type="submit" disabled={busy}>
                    {busy ? "Creating…" : "Create module"}
                  </button>
                </form>
              )}
            </section>
            <section className="teacher-course-resources">
              <div className="teacher-course-section-title">
                <h3>Curriculum summary</h3>
                <span>Live</span>
              </div>
              <p>
                Modules and lessons are loaded from the course service. Visibility reflects the
                current curriculum configuration.
              </p>
            </section>
          </aside>
          <section className="teacher-course-lesson-detail">
            <div className="teacher-course-lesson-header">
              <div>
                <div className="teacher-course-lesson-meta">
                  <span>{activeLesson ? "Selected lesson" : "No lesson selected"}</span>
                  <small>{activeModule?.title || "Select a module"}</small>
                </div>
                <h3>{activeLesson?.title || "Select a lesson"}</h3>
                <p>
                  {activeLesson?.description ||
                    "Select a lesson from the curriculum to review its details."}
                </p>
              </div>
              <small>
                {activeLesson?.isVisible === false
                  ? "Hidden from students"
                  : activeLesson
                    ? "Visible to students"
                    : ""}
              </small>
            </div>
            {activeModule && (
              <>
                <div className="teacher-course-objectives">
                  <div className="teacher-course-section-title">
                    <h3>Lesson management</h3>
                    <button type="button" onClick={() => setShowLessonForm((current) => !current)}>
                      + Add Lesson
                    </button>
                  </div>
                  <p>
                    Manage the lessons in <strong>{activeModule.title}</strong> through the
                    connected course service.
                  </p>
                  {showLessonForm && (
                    <form
                      className="teacher-course-inline-form"
                      onSubmit={(event) => void createLesson(event)}
                    >
                      <input
                        required
                        value={lessonTitle}
                        onChange={(event) => setLessonTitle(event.target.value)}
                        placeholder="Lesson title"
                        aria-label="Lesson title"
                      />
                      <textarea
                        value={lessonDescription}
                        onChange={(event) => setLessonDescription(event.target.value)}
                        placeholder="Description (optional)"
                      />
                      <button type="submit" disabled={busy}>
                        {busy ? "Creating…" : "Create lesson"}
                      </button>
                    </form>
                  )}
                </div>
                <div className="teacher-course-materials">
                  <div className="teacher-course-section-title">
                    <h3>Curriculum actions</h3>
                  </div>
                  <div className="teacher-course-material-grid">
                    <button type="button" onClick={() => notify("Lesson preview opened.")}>
                      <strong>PREVIEW</strong>
                      <span>{activeLesson?.title || "Select a lesson"}</span>
                      <small>Open lesson details and visibility</small>
                      <em>Preview</em>
                    </button>
                    <button
                      type="button"
                      onClick={() => notify("Material attachment is not available yet.")}
                    >
                      <strong>MEDIA</strong>
                      <span>Attach class material</span>
                      <small>Connect files to this lesson</small>
                      <em>Attach</em>
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

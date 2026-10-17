"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { teacherApi, type TeacherCourse } from "../lib/teacherApi";

type CourseStatus = "active" | "draft" | "archived";
type CourseView = "grid" | "list";

const courseAccents = ["indigo", "violet", "cyan", "amber"];

function normalizeStatus(course: TeacherCourse): CourseStatus {
  const status = (course.courseStatus || "ACTIVE").toLowerCase();
  if (status.includes("archive")) return "archived";
  if (status.includes("draft")) return "draft";
  return "active";
}

function formatStatus(status: CourseStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function TeacherMyCourses({
  courses,
  onOpenCourse,
  teacherId,
  onCourseCreated,
}: {
  courses: TeacherCourse[];
  onOpenCourse: (course: TeacherCourse) => void;
  teacherId?: string;
  onCourseCreated?: (course: TeacherCourse) => void;
}) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [status, setStatus] = useState<CourseStatus | "all">("all");
  const [view, setView] = useState<CourseView>("grid");
  const [notice, setNotice] = useState("");
  const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});
  const [loadingModules, setLoadingModules] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({
    courseName: "",
    courseDescription: "",
    subject: "",
    gradeId: "",
    courseFeeMonthly: "",
    isOnline: true,
  });
  const [savingCourse, setSavingCourse] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadModuleCounts() {
      setLoadingModules(true);
      const results = await Promise.all(
        courses.map(async (course) => {
          try {
            return [course.id, (await teacherApi.modules(course.id)).length] as const;
          } catch {
            return [course.id, 0] as const;
          }
        }),
      );
      if (!cancelled) {
        setModuleCounts(Object.fromEntries(results));
        setLoadingModules(false);
      }
    }
    void loadModuleCounts();
    return () => {
      cancelled = true;
    };
  }, [courses]);

  const subjects = useMemo(
    () => Array.from(new Set(courses.map((course) => course.subject).filter(Boolean))),
    [courses],
  );
  const counts = useMemo(
    () =>
      courses.reduce(
        (result, course) => {
          result[normalizeStatus(course)] += 1;
          return result;
        },
        { active: 0, draft: 0, archived: 0 } as Record<CourseStatus, number>,
      ),
    [courses],
  );
  const filteredCourses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesQuery =
        !search ||
        [course.courseName, course.courseDescription, course.subject]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search));
      const matchesSubject = subject === "all" || course.subject === subject;
      const matchesStatus = status === "all" || normalizeStatus(course) === status;
      return matchesQuery && matchesSubject && matchesStatus;
    });
  }, [courses, query, status, subject]);

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!teacherId) {
      notify("Your teacher profile is not ready. Refresh and try again.");
      return;
    }
    setSavingCourse(true);
    try {
      const created = await teacherApi.createCourse({
        ...courseForm,
        courseFeeMonthly: Number(courseForm.courseFeeMonthly),
        assignedTeacherId: teacherId,
        isVisible: true,
        isPublished: false,
      });
      onCourseCreated?.(created);
      setCourseForm({
        courseName: "",
        courseDescription: "",
        subject: "",
        gradeId: "",
        courseFeeMonthly: "",
        isOnline: true,
      });
      setShowCourseForm(false);
      notify("Course created successfully.");
    } catch (createError) {
      notify(createError instanceof Error ? createError.message : "Unable to create the course.");
    } finally {
      setSavingCourse(false);
    }
  }

  const totalStudents = courses.reduce((sum, course) => sum + (course.numberOfStudents || 0), 0);

  return (
    <section className="teacher-my-courses" aria-labelledby="my-courses-title">
      {notice && (
        <div className="teacher-my-courses-notice" role="status">
          {notice}
        </div>
      )}
      <div className="teacher-my-courses-hero">
        <div className="teacher-my-courses-hero-glow" />
        <div className="teacher-my-courses-hero-content">
          <div>
            <div className="teacher-my-courses-eyebrow">
              <span>Faculty workspace</span>
              <i />
              <span>Academic year 2024–2025</span>
            </div>
            <h2 id="my-courses-title">My Courses</h2>
            <p>
              Manage your active teaching curriculums, student cohorts, and course content from one
              focused workspace.
            </p>
          </div>
          <div className="teacher-my-courses-actions">
            <button type="button" onClick={() => notify("Course analytics are coming soon.")}>
              Course Analytics
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => setShowCourseForm((current) => !current)}
            >
              <span aria-hidden="true">+</span>
              Create New Course
            </button>
          </div>
        </div>
        {showCourseForm && (
          <form
            className="teacher-course-create-form"
            onSubmit={(event) => void createCourse(event)}
          >
            <div>
              <h3>Create New Course</h3>
              <p>Teacher course creation requires an administrator role in the current backend.</p>
            </div>
            <input
              required
              value={courseForm.courseName}
              onChange={(event) => setCourseForm({ ...courseForm, courseName: event.target.value })}
              placeholder="Course name"
              aria-label="Course name"
            />
            <input
              required
              value={courseForm.subject}
              onChange={(event) => setCourseForm({ ...courseForm, subject: event.target.value })}
              placeholder="Subject"
              aria-label="Subject"
            />
            <input
              required
              value={courseForm.gradeId}
              onChange={(event) => setCourseForm({ ...courseForm, gradeId: event.target.value })}
              placeholder="Grade ID"
              aria-label="Grade ID"
            />
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={courseForm.courseFeeMonthly}
              onChange={(event) =>
                setCourseForm({ ...courseForm, courseFeeMonthly: event.target.value })
              }
              placeholder="Monthly fee"
              aria-label="Monthly fee"
            />
            <textarea
              required
              value={courseForm.courseDescription}
              onChange={(event) =>
                setCourseForm({ ...courseForm, courseDescription: event.target.value })
              }
              placeholder="Course description"
              aria-label="Course description"
            />
            <label>
              <input
                type="checkbox"
                checked={courseForm.isOnline}
                onChange={(event) =>
                  setCourseForm({ ...courseForm, isOnline: event.target.checked })
                }
              />{" "}
              Online course
            </label>
            <div>
              <button type="submit" className="primary" disabled={savingCourse}>
                {savingCourse ? "Creating…" : "Create course"}
              </button>
              <button type="button" onClick={() => setShowCourseForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
        <div className="teacher-my-courses-kpis">
          <div>
            <strong>{counts.active}</strong>
            <span>Active courses</span>
          </div>
          <div>
            <strong>{totalStudents}</strong>
            <span>Total enrolled learners</span>
          </div>
          <div>
            <strong>{courses.length ? "91.2%" : "—"}</strong>
            <span>Average attendance</span>
          </div>
          <div>
            <strong>{counts.draft}</strong>
            <span>Draft courses</span>
          </div>
        </div>
      </div>

      <div className="teacher-my-courses-toolbar">
        <div className="teacher-my-courses-filters">
          <label className="teacher-my-courses-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search course name, subject..."
              aria-label="Search courses"
            />
          </label>
          <label className="teacher-my-courses-select">
            <span className="sr-only">Filter by subject</span>
            <select value={subject} onChange={(event) => setSubject(event.target.value)}>
              <option value="all">All subjects</option>
              {subjects.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="teacher-my-courses-toolbar-right">
          <div className="teacher-my-courses-status-tabs" aria-label="Filter by status">
            {(["all", "active", "draft", "archived"] as const).map((item) => {
              const count = item === "all" ? courses.length : counts[item];
              return (
                <button
                  type="button"
                  className={status === item ? "active" : ""}
                  key={item}
                  onClick={() => setStatus(item)}
                >
                  {item === "all" ? "All" : formatStatus(item)} <b>{count}</b>
                </button>
              );
            })}
          </div>
          <div className="teacher-my-courses-view-toggle" aria-label="Course layout">
            <button
              type="button"
              className={view === "grid" ? "active" : ""}
              aria-label="Grid view"
              onClick={() => setView("grid")}
            >
              ▦
            </button>
            <button
              type="button"
              className={view === "list" ? "active" : ""}
              aria-label="List view"
              onClick={() => setView("list")}
            >
              ≡
            </button>
          </div>
        </div>
      </div>

      {filteredCourses.length ? (
        <div className={`teacher-my-courses-grid ${view === "list" ? "list-view" : ""}`}>
          {filteredCourses.map((course, index) => {
            const courseStatus = normalizeStatus(course);
            const accent = courseAccents[index % courseAccents.length];
            const moduleCount = moduleCounts[course.id] || 0;
            return (
              <article className={`teacher-my-course-card ${accent}`} key={course.id}>
                <div className="teacher-my-course-cover">
                  {course.courseThumbnail ? (
                    // Course thumbnails may come from a configured remote media service.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.courseThumbnail} alt="" />
                  ) : (
                    <div className="teacher-my-course-art" aria-hidden="true">
                      <span>{course.courseName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="teacher-my-course-cover-shade" />
                  <div className="teacher-my-course-cover-tags">
                    <span>{formatStatus(courseStatus)}</span>
                    {course.subject && <span>{course.subject}</span>}
                  </div>
                  <button
                    type="button"
                    className="teacher-my-course-menu"
                    aria-label={`More options for ${course.courseName}`}
                    onClick={() => notify(`More options for ${course.courseName} are coming soon.`)}
                  >
                    •••
                  </button>
                  <div className="teacher-my-course-cover-title">
                    <small>{course.online ? "Online course" : "In-person course"}</small>
                    <h3>{course.courseName}</h3>
                  </div>
                </div>
                <div className="teacher-my-course-body">
                  <div className="teacher-my-course-metrics">
                    <div>
                      <strong>{course.numberOfStudents || 0}</strong>
                      <span>Learners</span>
                    </div>
                    <div>
                      <strong>{loadingModules ? "—" : moduleCount}</strong>
                      <span>Modules</span>
                    </div>
                    <div>
                      <strong>—</strong>
                      <span>Attendance</span>
                    </div>
                  </div>
                  <div className="teacher-my-course-progress">
                    <div>
                      <span>Curriculum completion</span>
                      <strong>{moduleCount ? "Live" : "—"}</strong>
                    </div>
                    <span className="teacher-my-course-progress-track">
                      <i style={{ width: `${moduleCount ? 100 : 0}%` }} />
                    </span>
                  </div>
                  <div className="teacher-my-course-next">
                    <span className="teacher-my-course-live-dot" />
                    <div>
                      <small>Next teaching focus</small>
                      <strong>{index % 2 ? "Review lesson plans" : "Continue curriculum"}</strong>
                    </div>
                    <span>{index % 2 ? "Tomorrow" : "Today"}</span>
                  </div>
                </div>
                <div className="teacher-my-course-footer">
                  <button type="button" className="primary" onClick={() => onOpenCourse(course)}>
                    Open Course <span aria-hidden="true">→</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => notify(`${course.courseName} roster opened.`)}
                    aria-label={`View ${course.courseName} roster`}
                  >
                    ♧
                  </button>
                  <button
                    type="button"
                    onClick={() => notify(`${course.courseName} lesson plans opened.`)}
                    aria-label={`View ${course.courseName} lesson plans`}
                  >
                    ◫
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="teacher-my-courses-empty">
          <span aria-hidden="true">⌕</span>
          <strong>
            {courses.length ? "No courses match these filters" : "No courses assigned yet"}
          </strong>
          <p>
            {courses.length
              ? "Try a different search term or clear one of the filters."
              : "Assigned courses will appear here after an administrator adds them."}
          </p>
          {courses.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubject("all");
                setStatus("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}

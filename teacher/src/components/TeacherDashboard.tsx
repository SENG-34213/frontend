"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import TeacherAiAssistant from "../ai-assistant/TeacherAiAssistant";
import TeacherCommunication from "./TeacherCommunication";
import TeacherQuizzesAssessments from "./TeacherQuizzesAssessments";
import TeacherCalendarWorkspace from "./TeacherCalendarWorkspace";
import TeacherAssignmentSubmissions from "./TeacherAssignmentSubmissions";
import TeacherAttendanceManagement from "./TeacherAttendanceManagement";
import TeacherCourseDetailsCurriculum from "./TeacherCourseDetailsCurriculum";
import TeacherDashboardHome from "./TeacherDashboardHome";
import TeacherLearningMaterialsLibrary from "./TeacherLearningMaterialsLibrary";
import TeacherMentifyStudio from "./TeacherMentifyStudio";
import TeacherMyCourses from "./TeacherMyCourses";
import TeacherMyStudentsDirectory from "./TeacherMyStudentsDirectory";
import {
  teacherApi,
  type CourseLesson,
  type CourseModule,
  type TeacherCourse,
  type TeacherProfile,
} from "../lib/teacherApi";

function TeacherHome({
  profile,
  courses,
  onNavigate,
}: {
  profile: TeacherProfile | null;
  courses: TeacherCourse[];
  onNavigate: (view: "courses" | "quizzes" | "communication" | "assistant") => void;
}) {
  const totalStudents = courses.reduce((sum, course) => sum + (course.numberOfStudents || 0), 0);
  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Teacher";
  return (
    <section className="teacher-home">
      <div className="teacher-home-welcome">
        <div>
          <span className="teacher-kicker">TEACHER PORTAL</span>
          <h2>Welcome back, {displayName}</h2>
          <p>Manage your courses, support your students, and keep learning moving forward.</p>
        </div>
        <div className="teacher-home-actions">
          <button type="button" onClick={() => onNavigate("courses")}>
            View Courses
          </button>
          <button type="button" className="primary" onClick={() => onNavigate("quizzes")}>
            Quick Report
          </button>
        </div>
      </div>
      <div className="teacher-stat-grid">
        <article className="teacher-stat-card indigo">
          <span>â™™</span>
          <b>{totalStudents || "â€”"}</b>
          <small>TOTAL STUDENTS</small>
        </article>
        <article className="teacher-stat-card violet">
          <span>âŒ</span>
          <b>{courses.length || "â€”"}</b>
          <small>ACTIVE COURSES</small>
        </article>
        <article className="teacher-stat-card red">
          <span>â˜†</span>
          <b>â€”</b>
          <small>PENDING GRADING</small>
          <em>API endpoint not available</em>
        </article>
        <article className="teacher-stat-card green">
          <span>â™™+</span>
          <b>â€”</b>
          <small>PENDING ENROLLMENTS</small>
          <em>API endpoint not available</em>
        </article>
      </div>
      <div className="teacher-home-grid">
        <section className="teacher-home-courses">
          <div className="teacher-home-heading">
            <h3>My Courses</h3>
            <button type="button" onClick={() => onNavigate("courses")}>
              View All
            </button>
          </div>
          <div className="teacher-home-course-grid">
            {courses.slice(0, 2).map((course) => (
              <article className="teacher-home-course" key={course.id}>
                {course.courseThumbnail ? (
                  // Course thumbnails may come from a configured remote media service.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.courseThumbnail} alt="" />
                ) : (
                  <div className="teacher-course-art">{course.courseName.charAt(0)}</div>
                )}
                <div className="teacher-home-course-body">
                  <span className="teacher-status-pill">{course.courseStatus || "ACTIVE"}</span>
                  <h4>{course.courseName}</h4>
                  <p>â™™ {course.numberOfStudents || 0} Students</p>
                  <button type="button" onClick={() => onNavigate("courses")}>
                    Manage Course
                  </button>
                </div>
              </article>
            ))}
            {!courses.length && (
              <div className="teacher-empty">
                <strong>No courses assigned yet</strong>
                <p>Your courses will appear here after an admin assigns them.</p>
              </div>
            )}
          </div>
          <article className="teacher-ai-callout">
            <span>âœ¦</span>
            <div>
              <h3>AI Insights</h3>
              <p>
                Connect the assessment and student services to surface grading priorities and
                targeted revision recommendations here.
              </p>
              <button type="button" onClick={() => onNavigate("assistant")}>
                Open Mentify AI â†’
              </button>
            </div>
          </article>
        </section>
        <aside className="teacher-home-side">
          <section className="teacher-side-card">
            <div className="teacher-home-heading">
              <h3>Enrolment Requests</h3>
              <b>â€”</b>
            </div>
            <p className="teacher-side-muted">
              Enrollment request data is not exposed by the current teacher API.
            </p>
            <button type="button" onClick={() => onNavigate("courses")}>
              Review Courses
            </button>
          </section>
          <section className="teacher-side-card">
            <div className="teacher-home-heading">
              <h3>Assignments to Grade</h3>
              <b>â€”</b>
            </div>
            <p className="teacher-side-muted">
              Assignment grading data will appear when the grading endpoint is connected.
            </p>
            <button type="button" onClick={() => onNavigate("quizzes")}>
              Open Assessments
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}

void TeacherHome;

function TeacherSamplePage({
  title,
  kicker,
  description,
  type,
}: {
  title: string;
  kicker: string;
  description: string;
  type: "students" | "assignments" | "attendance" | "notifications";
}) {
  const rows =
    type === "students"
      ? [
          ["Alex Mercer", "Applied Physics", "Active"],
          ["Elena Rodriguez", "Statistical Research", "Active"],
          ["Marcus Chen", "Quantum Computing", "Needs review"],
        ]
      : type === "assignments"
        ? [
            ["Midterm Paper: Relativism", "Quantum Physics", "Due in 3 days"],
            ["Data Set Analysis: Alpha", "Statistical Research", "Due today"],
            ["Lab Reflection", "Applied Physics", "Submitted"],
          ]
        : type === "attendance"
          ? [
              ["Applied Physics", "18 students", "94%"],
              ["Statistical Research", "24 students", "88%"],
              ["Quantum Computing", "16 students", "91%"],
            ]
          : [
              ["New enrolment request", "2 students are waiting for review", "Now"],
              ["Quiz submission ready", "Quantum Physics Â· 12 new attempts", "1h ago"],
              ["AI insight available", "Review class performance trends", "Yesterday"],
            ];
  return (
    <section className="teacher-sample-page">
      <div className="teacher-sample-heading">
        <div>
          <span className="teacher-kicker">{kicker}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <button type="button" className="teacher-sample-primary">
          {type === "students"
            ? "Add Student"
            : type === "assignments"
              ? "Create Assignment"
              : type === "attendance"
                ? "Take Attendance"
                : "Mark All Read"}
        </button>
      </div>
      <div className="teacher-sample-stats">
        <div>
          <small>
            {type === "students"
              ? "TOTAL STUDENTS"
              : type === "assignments"
                ? "TO REVIEW"
                : type === "attendance"
                  ? "AVG. ATTENDANCE"
                  : "UNREAD"}
          </small>
          <b>{type === "attendance" ? "91%" : type === "notifications" ? "3" : "24"}</b>
        </div>
        <div>
          <small>ACTIVE COURSES</small>
          <b>3</b>
        </div>
        <div>
          <small>THIS WEEK</small>
          <b>+12%</b>
        </div>
      </div>
      <section className="teacher-sample-table">
        <div className="teacher-sample-table-head">
          <span>
            {type === "students" ? "Student" : type === "attendance" ? "Course" : "Activity"}
          </span>
          <span>{type === "students" ? "Course" : "Details"}</span>
          <span>Status</span>
        </div>
        {rows.map(([primary, secondary, status]) => (
          <div className="teacher-sample-row" key={primary}>
            <strong>{primary}</strong>
            <span>{secondary}</span>
            <em>{status}</em>
            <button type="button">View â†’</button>
          </div>
        ))}
      </section>
    </section>
  );
}

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TeacherCourse | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<Record<string, CourseLesson[]>>({});
  const [activeView, setActiveView] = useState<
    | "dashboard"
    | "courses"
    | "course-details"
    | "students"
    | "assignments"
    | "attendance"
    | "materials"
    | "calendar"
    | "notifications"
    | "messages"
    | "communication"
    | "quizzes"
    | "assistant"
    | "studio"
  >("dashboard");
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState("");
  const [contentError, setContentError] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [lessonTitles, setLessonTitles] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginApiUrl, setLoginApiUrl] = useState("http://localhost:8080");
  const [loggingIn, setLoggingIn] = useState(false);

  const displayName = useMemo(
    () => (profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Teacher"),
    [profile],
  );

  useEffect(() => {
    const storedApiUrl =
      sessionStorage.getItem("mentify_api_url") ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:8080";
    // Browser session hydration must happen after mount to keep server and client markup consistent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoginApiUrl(storedApiUrl);
    setAuthenticated(Boolean(sessionStorage.getItem("mentify_access_token")));
    setAuthReady(true);
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setLoggingIn(true);
    setAuthError("");
    const base = loginApiUrl.trim().replace(/\/$/, "");
    try {
      const response = await fetch(`${base}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginEmail.trim(), password: loginPassword }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(body.message || body.error || "Email or password is incorrect.");
      const session = body.data ?? {};
      const user = session.user ?? {};
      if (!session.accessToken)
        throw new Error("The login response did not contain an access token.");
      if (user.role !== "TEACHER") throw new Error("This account does not have teacher access.");
      sessionStorage.setItem("mentify_api_url", base);
      sessionStorage.setItem("mentify_access_token", session.accessToken);
      if (session.refreshToken)
        sessionStorage.setItem("mentify_refresh_token", session.refreshToken);
      setLoginPassword("");
      setAuthenticated(true);
    } catch (loginError) {
      setAuthError(loginError instanceof Error ? loginError.message : "Could not sign in.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function loadContent(course: TeacherCourse) {
    setSelectedCourse(course);
    setContentLoading(true);
    setContentError("");
    try {
      const nextModules = await teacherApi.modules(course.id);
      setModules(nextModules);
      const lessonEntries = await Promise.all(
        nextModules.map(
          async (module) => [module.id, await teacherApi.lessons(course.id, module.id)] as const,
        ),
      );
      setLessons(Object.fromEntries(lessonEntries));
    } catch (loadError) {
      setContentError(
        loadError instanceof Error ? loadError.message : "Could not load course modules.",
      );
    } finally {
      setContentLoading(false);
    }
  }

  useEffect(() => {
    if (!authReady || !authenticated) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [currentProfile, teacherCourses] = await Promise.all([
          teacherApi.profile(),
          teacherApi.courses(),
        ]);
        if (cancelled) return;
        setProfile(currentProfile);
        setCourses(teacherCourses);
        if (teacherCourses[0]) await loadContent(teacherCourses[0]);
      } catch (loadError) {
        if (!cancelled) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : "Could not load your teacher workspace.";
          if (message.includes("401")) {
            setAuthenticated(false);
            setAuthError("Your teacher session expired. Sign in again.");
          } else setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // Initial workspace load intentionally runs once.
  }, [authReady, authenticated]);

  async function createModule(event: FormEvent) {
    event.preventDefault();
    if (!selectedCourse || !moduleTitle.trim()) return;
    setSaving(true);
    try {
      const created = await teacherApi.createModule(selectedCourse.id, {
        title: moduleTitle.trim(),
        description: moduleDescription.trim(),
        sequenceOrder: modules.length + 1,
      });
      setModules((current) => [...current, created]);
      setModuleTitle("");
      setModuleDescription("");
    } catch (saveError) {
      setContentError(
        saveError instanceof Error ? saveError.message : "Could not create the module.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function createLesson(event: FormEvent, module: CourseModule) {
    event.preventDefault();
    if (!selectedCourse || !lessonTitles[module.id]?.trim()) return;
    setSaving(true);
    try {
      const created = await teacherApi.createLesson(selectedCourse.id, module.id, {
        title: lessonTitles[module.id].trim(),
        description: "",
      });
      setLessons((current) => ({
        ...current,
        [module.id]: [...(current[module.id] || []), created],
      }));
      setLessonTitles((current) => ({ ...current, [module.id]: "" }));
    } catch (saveError) {
      setContentError(
        saveError instanceof Error ? saveError.message : "Could not create the lesson.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!authReady)
    return (
      <main className="teacher-dashboard">
        <div className="teacher-state">Preparing secure sign-inâ€¦</div>
      </main>
    );
  if (!authenticated)
    return (
      <main className="teacher-dashboard">
        <section className="teacher-login-card">
          <span className="teacher-kicker">MENTIFY TEACHER PORTAL</span>
          <h1>Sign in to your workspace</h1>
          <p>Use your teacher account to access assigned courses and learning content.</p>
          {authError && <div className="teacher-inline-error">{authError}</div>}
          <form onSubmit={signIn}>
            <label>
              <span>API base URL</span>
              <input
                value={loginApiUrl}
                onChange={(event) => setLoginApiUrl(event.target.value)}
                placeholder="http://localhost:8080"
              />
            </label>
            <label>
              <span>Email</span>
              <input
                required
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="teacher@example.com"
                autoComplete="username"
              />
            </label>
            <label>
              <span>Password</span>
              <input
                required
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
            </label>
            <button type="submit" disabled={loggingIn}>
              {loggingIn ? "Signing inâ€¦" : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    );
  if (loading)
    return (
      <main className="teacher-dashboard">
        <div className="teacher-state">Loading your teaching workspaceâ€¦</div>
      </main>
    );
  if (error)
    return (
      <main className="teacher-dashboard">
        <div className="teacher-state teacher-state-error">
          <h1>Teacher workspace unavailable</h1>
          <p>{error}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </main>
    );

  return (
    <main className="teacher-dashboard">
      <div className="teacher-dashboard-shell">
        <aside className="teacher-sidebar">
          <div className="teacher-sidebar-brand">
            <span className="teacher-brand-mark">M</span>
            <span>Mentify</span>
          </div>
          <div className="teacher-sidebar-label">TEACHER PORTAL</div>
          <nav className="teacher-sidebar-nav" aria-label="Teacher workspace">
            <button
              type="button"
              className={activeView === "dashboard" ? "active" : ""}
              onClick={() => setActiveView("dashboard")}
            >
              <span className="teacher-nav-icon">â–¦</span>
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              className={
                activeView === "courses" || activeView === "course-details" ? "active" : ""
              }
              onClick={() => setActiveView("courses")}
            >
              <span className="teacher-nav-icon">âŒ‚</span>
              <span>My Courses</span>
              <em>{courses.length}</em>
            </button>
            <button
              type="button"
              className={activeView === "students" ? "active" : ""}
              onClick={() => setActiveView("students")}
            >
              <span className="teacher-nav-icon">â™™</span>
              <span>My Students</span>
            </button>
            <button
              type="button"
              className={activeView === "assignments" ? "active" : ""}
              onClick={() => setActiveView("assignments")}
            >
              <span className="teacher-nav-icon">âœ“</span>
              <span>Assignments</span>
            </button>
            <button
              type="button"
              className={activeView === "assistant" ? "active" : ""}
              onClick={() => setActiveView("assistant")}
            >
              <span className="teacher-nav-icon">â™™</span>
              <span>AI Insights</span>
            </button>
            <button
              type="button"
              className={activeView === "studio" ? "active" : ""}
              onClick={() => setActiveView("studio")}
            >
              <span className="teacher-nav-icon">S</span>
              <span>Mentify Studio</span>
            </button>
            <button
              type="button"
              className={activeView === "attendance" ? "active" : ""}
              onClick={() => setActiveView("attendance")}
            >
              <span className="teacher-nav-icon">â—‰</span>
              <span>Attendance</span>
            </button>
            <button
              type="button"
              className={activeView === "materials" ? "active" : ""}
              onClick={() => setActiveView("materials")}
            >
              <span className="teacher-nav-icon">â—ˆ</span>
              <span>Materials</span>
            </button>
            <button
              type="button"
              className={activeView === "calendar" ? "active" : ""}
              onClick={() => setActiveView("calendar")}
            >
              <span className="teacher-nav-icon">â–£</span>
              <span>Calendar</span>
            </button>
            <button
              type="button"
              className={activeView === "notifications" ? "active" : ""}
              onClick={() => setActiveView("notifications")}
            >
              <span className="teacher-nav-icon">â—Œ</span>
              <span>Notifications</span>
            </button>
            <button
              type="button"
              className={activeView === "messages" ? "active" : ""}
              onClick={() => setActiveView("messages")}
            >
              <span className="teacher-nav-icon">â–±</span>
              <span>Messages</span>
            </button>
            <button
              type="button"
              className={activeView === "quizzes" ? "active" : ""}
              onClick={() => setActiveView("quizzes")}
            >
              <span className="teacher-nav-icon">â–£</span>
              <span>Quizzes &amp; Assessments</span>
            </button>
          </nav>
          <div className="teacher-sidebar-spacer" />
          <div className="teacher-sidebar-profile">
            <span className="teacher-sidebar-avatar">{displayName.charAt(0).toUpperCase()}</span>
            <span>
              <strong>{displayName}</strong>
              <small>{profile?.teacherProfile?.teacherCode || "Teacher"}</small>
            </span>
            <span className="teacher-sidebar-more">â€¢â€¢â€¢</span>
          </div>
        </aside>
        <div className="teacher-dashboard-main">
          <header className="teacher-dashboard-header">
            <div>
              <span className="teacher-kicker">TEACHER PORTAL / {activeView.toUpperCase()}</span>
              <h1>
                {activeView === "dashboard"
                  ? "Dashboard"
                  : activeView === "courses"
                    ? "My Courses"
                    : activeView === "course-details"
                      ? "Course Details & Curriculum"
                      : activeView === "materials"
                        ? "Learning Materials & Media Library"
                        : activeView === "quizzes"
                          ? "Quizzes & Assessments"
                          : activeView === "calendar"
                            ? "Calendar"
                            : activeView === "communication" || activeView === "messages"
                              ? "Messages & Communication"
                              : activeView === "studio"
                                ? "Mentify Studio"
                                : activeView === "students"
                                  ? "My Students"
                                  : activeView === "assignments"
                                    ? "Assignments & Submissions"
                                    : activeView === "attendance"
                                      ? "Attendance Management"
                                      : activeView === "notifications"
                                        ? "Notifications"
                                        : "Your intelligent teaching partner"}
              </h1>
              <p>
                {activeView === "dashboard"
                  ? "A quick view of your courses, students, and teaching priorities."
                  : activeView === "courses"
                    ? "Manage your courses, student cohorts, and teaching content."
                    : activeView === "course-details"
                      ? "Explore course progress, curriculum modules, and lesson details."
                      : activeView === "materials"
                        ? "Organize, share, and manage your teaching resources."
                        : activeView === "quizzes"
                          ? "Create, distribute, and analyze assessments for your students."
                          : activeView === "calendar"
                            ? "Plan and review upcoming course events."
                            : activeView === "communication" || activeView === "messages"
                              ? "Keep your course community moving forward."
                              : activeView === "studio"
                                ? "Plan, refine, and launch intelligent learning experiences."
                                : activeView === "assignments"
                                  ? "Manage coursework, submissions, and grading priorities."
                                  : activeView === "attendance"
                                    ? "Track daily attendance and review student absence patterns."
                                    : "Review the latest activity from your teaching workspace."}
              </p>
            </div>
            <div className="teacher-header-actions">
              <span className="teacher-live-indicator">
                <i /> Workspace live
              </span>
              <div className="teacher-profile-pill">
                <strong>{profile?.teacherProfile?.teacherCode || "Teacher"}</strong>
                <span>{profile?.email}</span>
              </div>
            </div>
          </header>
          {activeView === "dashboard" ? (
            <TeacherDashboardHome
              profile={profile}
              courses={courses}
              onNavigate={(view) => setActiveView(view)}
            />
          ) : activeView === "assistant" ? (
            <TeacherAiAssistant />
          ) : activeView === "studio" ? (
            <TeacherMentifyStudio />
          ) : activeView === "quizzes" ? (
            <TeacherQuizzesAssessments courses={courses} />
          ) : activeView === "attendance" ? (
            <TeacherAttendanceManagement />
          ) : activeView === "materials" ? (
            <TeacherLearningMaterialsLibrary courses={courses} />
          ) : activeView === "calendar" ? (
            <TeacherCalendarWorkspace courses={courses} />
          ) : activeView === "communication" || activeView === "messages" ? (
            <TeacherCommunication courses={courses} currentUserId={profile?.keycloakUserId} />
          ) : activeView === "courses" ? (
            <TeacherMyCourses
              courses={courses}
              onOpenCourse={(course) => {
                setSelectedCourse(course);
                setActiveView("course-details");
              }}
            />
          ) : activeView === "course-details" ? (
            <TeacherCourseDetailsCurriculum courses={courses} courseId={selectedCourse?.id} />
          ) : activeView === "assignments" ? (
            <TeacherAssignmentSubmissions courses={courses} />
          ) : activeView === "students" ? (
            <TeacherMyStudentsDirectory courses={courses} />
          ) : activeView === "notifications" ? (
            <TeacherSamplePage
              type="notifications"
              title="Notifications"
              kicker={activeView.toUpperCase()}
              description="A Figma-inspired workspace for your teaching operations and class activity."
            />
          ) : (
            <div className="teacher-workspace-grid">
              <aside className="teacher-course-list">
                <div className="teacher-section-heading">
                  <div>
                    <span className="teacher-kicker">COURSE CATALOG</span>
                    <h2>My courses</h2>
                  </div>
                  <strong>{courses.length}</strong>
                </div>
                {courses.length ? (
                  courses.map((course) => (
                    <button
                      type="button"
                      key={course.id}
                      className={`teacher-course-item ${selectedCourse?.id === course.id ? "active" : ""}`}
                      onClick={() => void loadContent(course)}
                    >
                      <span className="teacher-course-icon">
                        {course.courseName.charAt(0).toUpperCase()}
                      </span>
                      <span>
                        <strong>{course.courseName}</strong>
                        <small>
                          {course.subject || "General"} Â· {course.numberOfStudents || 0} students
                        </small>
                      </span>
                      <em>{course.courseStatus || "DRAFT"}</em>
                    </button>
                  ))
                ) : (
                  <div className="teacher-empty">
                    <strong>No courses assigned yet</strong>
                    <p>Your assigned courses will appear here once an admin creates them.</p>
                  </div>
                )}
              </aside>
              <section className="teacher-content-panel">
                {selectedCourse ? (
                  <>
                    <div className="teacher-content-heading">
                      <div>
                        <span className="teacher-kicker">COURSE CONTENT</span>
                        <h2>{selectedCourse.courseName}</h2>
                        <p>
                          {selectedCourse.courseDescription ||
                            "Build modules and lessons for your students."}
                        </p>
                      </div>
                      <span className="teacher-course-status">
                        {selectedCourse.courseStatus || "DRAFT"}
                      </span>
                    </div>
                    {contentError && <div className="teacher-inline-error">{contentError}</div>}
                    <div className="teacher-module-create">
                      <form onSubmit={createModule}>
                        <h3>Add a module</h3>
                        <div className="teacher-form-row">
                          <input
                            required
                            value={moduleTitle}
                            onChange={(event) => setModuleTitle(event.target.value)}
                            placeholder="Module title"
                          />
                          <input
                            value={moduleDescription}
                            onChange={(event) => setModuleDescription(event.target.value)}
                            placeholder="Short description (optional)"
                          />
                          <button type="submit" disabled={saving}>
                            {saving ? "Savingâ€¦" : "Add module"}
                          </button>
                        </div>
                      </form>
                    </div>
                    {contentLoading ? (
                      <div className="teacher-state">Loading modulesâ€¦</div>
                    ) : modules.length ? (
                      <div className="teacher-module-list">
                        {modules.map((module) => (
                          <article className="teacher-module-card" key={module.id}>
                            <div className="teacher-module-heading">
                              <div>
                                <span>Module {module.sequenceOrder}</span>
                                <h3>{module.title}</h3>
                                <p>{module.description || "No description provided."}</p>
                              </div>
                              <strong>{lessons[module.id]?.length || 0} lessons</strong>
                            </div>
                            <div className="teacher-lesson-list">
                              {(lessons[module.id] || []).map((lesson) => (
                                <div className="teacher-lesson" key={lesson.id}>
                                  <span>â†³</span>
                                  <strong>{lesson.title}</strong>
                                  <small>{lesson.releaseDate || "Available when published"}</small>
                                </div>
                              ))}
                            </div>
                            <form
                              className="teacher-lesson-create"
                              onSubmit={(event) => void createLesson(event, module)}
                            >
                              <input
                                required
                                value={lessonTitles[module.id] || ""}
                                onChange={(event) =>
                                  setLessonTitles((current) => ({
                                    ...current,
                                    [module.id]: event.target.value,
                                  }))
                                }
                                placeholder="Add lesson title"
                              />
                              <button type="submit" disabled={saving}>
                                Add lesson
                              </button>
                            </form>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="teacher-empty">
                        <strong>No modules yet</strong>
                        <p>Create the first module to start organizing this course.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="teacher-empty teacher-empty-large">
                    <strong>Select a course</strong>
                    <p>Choose one of your assigned courses to manage its modules and lessons.</p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import TeacherAiAssistant from "../ai-assistant/TeacherAiAssistant";
import { teacherApi, type CourseLesson, type CourseModule, type TeacherCourse, type TeacherProfile } from "../lib/teacherApi";

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TeacherCourse | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<Record<string, CourseLesson[]>>({});
  const [activeView, setActiveView] = useState<"courses" | "assistant">("courses");
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

  const displayName = useMemo(() => profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Teacher", [profile]);

  useEffect(() => {
    const storedApiUrl = sessionStorage.getItem("mentify_api_url") || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
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
      const response = await fetch(`${base}/api/v1/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: loginEmail.trim(), password: loginPassword }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || body.error || "Email or password is incorrect.");
      const session = body.data ?? {};
      const user = session.user ?? {};
      if (!session.accessToken) throw new Error("The login response did not contain an access token.");
      if (user.role !== "TEACHER") throw new Error("This account does not have teacher access.");
      sessionStorage.setItem("mentify_api_url", base);
      sessionStorage.setItem("mentify_access_token", session.accessToken);
      if (session.refreshToken) sessionStorage.setItem("mentify_refresh_token", session.refreshToken);
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
      const lessonEntries = await Promise.all(nextModules.map(async (module) => [module.id, await teacherApi.lessons(course.id, module.id)] as const));
      setLessons(Object.fromEntries(lessonEntries));
    } catch (loadError) {
      setContentError(loadError instanceof Error ? loadError.message : "Could not load course modules.");
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
        const [currentProfile, teacherCourses] = await Promise.all([teacherApi.profile(), teacherApi.courses()]);
        if (cancelled) return;
        setProfile(currentProfile);
        setCourses(teacherCourses);
        if (teacherCourses[0]) await loadContent(teacherCourses[0]);
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : "Could not load your teacher workspace.";
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
    return () => { cancelled = true; };
  // Initial workspace load intentionally runs once.
  }, [authReady, authenticated]);

  async function createModule(event: FormEvent) {
    event.preventDefault();
    if (!selectedCourse || !moduleTitle.trim()) return;
    setSaving(true);
    try {
      const created = await teacherApi.createModule(selectedCourse.id, { title: moduleTitle.trim(), description: moduleDescription.trim(), sequenceOrder: modules.length + 1 });
      setModules((current) => [...current, created]);
      setModuleTitle("");
      setModuleDescription("");
    } catch (saveError) {
      setContentError(saveError instanceof Error ? saveError.message : "Could not create the module.");
    } finally {
      setSaving(false);
    }
  }

  async function createLesson(event: FormEvent, module: CourseModule) {
    event.preventDefault();
    if (!selectedCourse || !lessonTitles[module.id]?.trim()) return;
    setSaving(true);
    try {
      const created = await teacherApi.createLesson(selectedCourse.id, module.id, { title: lessonTitles[module.id].trim(), description: "" });
      setLessons((current) => ({ ...current, [module.id]: [...(current[module.id] || []), created] }));
      setLessonTitles((current) => ({ ...current, [module.id]: "" }));
    } catch (saveError) {
      setContentError(saveError instanceof Error ? saveError.message : "Could not create the lesson.");
    } finally {
      setSaving(false);
    }
  }

  if (!authReady) return <main className="teacher-dashboard"><div className="teacher-state">Preparing secure sign-in…</div></main>;
  if (!authenticated) return <main className="teacher-dashboard"><section className="teacher-login-card"><span className="teacher-kicker">MENTIFY TEACHER PORTAL</span><h1>Sign in to your workspace</h1><p>Use your teacher account to access assigned courses and learning content.</p>{authError && <div className="teacher-inline-error">{authError}</div>}<form onSubmit={signIn}><label><span>API base URL</span><input value={loginApiUrl} onChange={(event) => setLoginApiUrl(event.target.value)} placeholder="http://localhost:8080" /></label><label><span>Email</span><input required type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="teacher@example.com" autoComplete="username" /></label><label><span>Password</span><input required type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="Your password" autoComplete="current-password" /></label><button type="submit" disabled={loggingIn}>{loggingIn ? "Signing in…" : "Sign in"}</button></form></section></main>;
  if (loading) return <main className="teacher-dashboard"><div className="teacher-state">Loading your teaching workspace…</div></main>;
  if (error) return <main className="teacher-dashboard"><div className="teacher-state teacher-state-error"><h1>Teacher workspace unavailable</h1><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div></main>;

  return <main className="teacher-dashboard">
    <header className="teacher-dashboard-header"><div><span className="teacher-kicker">TEACHER WORKSPACE</span><h1>Welcome back, {displayName}</h1><p>Manage your assigned courses and build learning content.</p></div><div className="teacher-profile-pill"><strong>{profile?.teacherProfile?.teacherCode || "Teacher"}</strong><span>{profile?.email}</span></div></header>
    <nav className="teacher-dashboard-tabs" aria-label="Teacher workspace"><button type="button" className={activeView === "courses" ? "active" : ""} onClick={() => setActiveView("courses")}>My courses <span>{courses.length}</span></button><button type="button" className={activeView === "assistant" ? "active" : ""} onClick={() => setActiveView("assistant")}>Mentify AI</button></nav>
    {activeView === "assistant" ? <TeacherAiAssistant /> : <div className="teacher-workspace-grid">
      <aside className="teacher-course-list"><div className="teacher-section-heading"><div><span className="teacher-kicker">COURSE CATALOG</span><h2>My courses</h2></div><strong>{courses.length}</strong></div>{courses.length ? courses.map((course) => <button type="button" key={course.id} className={`teacher-course-item ${selectedCourse?.id === course.id ? "active" : ""}`} onClick={() => void loadContent(course)}><span className="teacher-course-icon">{course.courseName.charAt(0).toUpperCase()}</span><span><strong>{course.courseName}</strong><small>{course.subject || "General"} · {course.numberOfStudents || 0} students</small></span><em>{course.courseStatus || "DRAFT"}</em></button>) : <div className="teacher-empty"><strong>No courses assigned yet</strong><p>Your assigned courses will appear here once an admin creates them.</p></div>}</aside>
      <section className="teacher-content-panel">{selectedCourse ? <><div className="teacher-content-heading"><div><span className="teacher-kicker">COURSE CONTENT</span><h2>{selectedCourse.courseName}</h2><p>{selectedCourse.courseDescription || "Build modules and lessons for your students."}</p></div><span className="teacher-course-status">{selectedCourse.courseStatus || "DRAFT"}</span></div>{contentError && <div className="teacher-inline-error">{contentError}</div>}<div className="teacher-module-create"><form onSubmit={createModule}><h3>Add a module</h3><div className="teacher-form-row"><input required value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} placeholder="Module title" /><input value={moduleDescription} onChange={(event) => setModuleDescription(event.target.value)} placeholder="Short description (optional)" /><button type="submit" disabled={saving}>{saving ? "Saving…" : "Add module"}</button></div></form></div>{contentLoading ? <div className="teacher-state">Loading modules…</div> : modules.length ? <div className="teacher-module-list">{modules.map((module) => <article className="teacher-module-card" key={module.id}><div className="teacher-module-heading"><div><span>Module {module.sequenceOrder}</span><h3>{module.title}</h3><p>{module.description || "No description provided."}</p></div><strong>{lessons[module.id]?.length || 0} lessons</strong></div><div className="teacher-lesson-list">{(lessons[module.id] || []).map((lesson) => <div className="teacher-lesson" key={lesson.id}><span>↳</span><strong>{lesson.title}</strong><small>{lesson.releaseDate || "Available when published"}</small></div>)}</div><form className="teacher-lesson-create" onSubmit={(event) => void createLesson(event, module)}><input required value={lessonTitles[module.id] || ""} onChange={(event) => setLessonTitles((current) => ({ ...current, [module.id]: event.target.value }))} placeholder="Add lesson title" /><button type="submit" disabled={saving}>Add lesson</button></form></article>)}</div> : <div className="teacher-empty"><strong>No modules yet</strong><p>Create the first module to start organizing this course.</p></div>}</> : <div className="teacher-empty teacher-empty-large"><strong>Select a course</strong><p>Choose one of your assigned courses to manage its modules and lessons.</p></div>}</section>
    </div>}
  </main>;
}

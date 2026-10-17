"use client";

import { useEffect, useState } from "react";
import type { CalendarEvent, TeacherCourse, TeacherProfile } from "../lib/teacherApi";
import { teacherApi } from "../lib/teacherApi";

type Props = {
  profile: TeacherProfile | null;
  courses: TeacherCourse[];
  onNavigate: (view: "courses" | "quizzes" | "communication" | "assistant") => void;
};

export default function TeacherDashboardHome({ profile, courses, onNavigate }: Props) {
  const [notice, setNotice] = useState("");
  const [sessions, setSessions] = useState<CalendarEvent[]>([]);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Teacher";
  const totalStudents = courses.reduce((sum, course) => sum + (course.numberOfStudents || 0), 0);

  useEffect(() => {
    let cancelled = false;
    async function loadSummary() {
      setLoadingSummary(true);
      try {
        const [events, quizzes, assignmentGroups] = await Promise.all([
          teacherApi.upcomingCalendarEvents(6).catch(() => []),
          teacherApi.quizzes().catch(() => []),
          Promise.all(
            courses.map(async (course) => {
              const assignments = await teacherApi.assignments(course.id).catch(() => []);
              const submissions = await Promise.all(
                assignments.map((assignment) =>
                  teacherApi.assignmentSubmissions(assignment.id).catch(() => []),
                ),
              );
              return { assignments, submissions: submissions.flat() };
            }),
          ),
        ]);
        if (!cancelled) {
          setSessions(events);
          setQuizCount(quizzes.length);
          setAssignmentCount(
            assignmentGroups.reduce((sum, group) => sum + group.assignments.length, 0),
          );
          setPendingReviews(
            assignmentGroups.reduce(
              (sum, group) =>
                sum +
                group.submissions.filter((submission) =>
                  ["SUBMITTED", "UNDER_REVIEW"].includes(submission.status),
                ).length,
              0,
            ),
          );
          setSummaryError("");
        }
      } catch (loadError) {
        if (!cancelled)
          setSummaryError(
            loadError instanceof Error
              ? loadError.message
              : "Some dashboard metrics are unavailable.",
          );
      } finally {
        if (!cancelled) setLoadingSummary(false);
      }
    }
    void loadSummary();
    return () => {
      cancelled = true;
    };
  }, [courses]);

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <section className="teacher-dashboard-home" aria-labelledby="teacher-dashboard-title">
      {notice && (
        <div className="teacher-dashboard-notice" role="status">
          {notice}
        </div>
      )}
      {summaryError && (
        <div className="teacher-dashboard-notice" role="alert">
          {summaryError}
        </div>
      )}
      <div className="teacher-dashboard-welcome">
        <div>
          <span className="teacher-dashboard-kicker">Teacher workspace · Thursday, Oct 24</span>
          <h2 id="teacher-dashboard-title">
            Good morning, {displayName} <span aria-hidden="true">👋</span>
          </h2>
          <p>
            {loadingSummary
              ? "Loading your teaching priorities…"
              : `You have ${sessions.length} upcoming sessions and ${pendingReviews} submissions to review.`}
          </p>
        </div>
        <div className="teacher-dashboard-welcome-actions">
          <button type="button" onClick={() => onNavigate("assistant")}>
            ✦ Launch AI Teaching Copilot
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => notify("Today's schedule opened.")}
          >
            ▣ View Today&apos;s Schedule
          </button>
        </div>
      </div>

      <div className="teacher-dashboard-kpis">
        <Kpi
          icon="▣"
          label="Active Courses"
          value={`${courses.length} Active`}
          detail="Assigned teacher courses"
          trend="Live course service"
        />
        <Kpi
          icon="♧"
          label="Enrolled Students"
          value={`${totalStudents} Students`}
          detail="Across assigned courses"
          trend="Live enrollment totals"
        />
        <Kpi
          icon="▣"
          label="Today's Sessions"
          value={`${sessions.length} Sessions`}
          detail="Upcoming calendar events"
          trend={sessions[0] ? `● Next: ${sessions[0].title}` : "No upcoming sessions"}
        />
        <Kpi
          icon="☷"
          label="Pending Reviews"
          value={`${pendingReviews} Items`}
          detail={`${quizCount} quizzes, ${assignmentCount} assignments tracked`}
          trend="● Submission service"
          danger
        />
        <Kpi
          icon="▤"
          label="Monthly Earnings"
          value="—"
          detail="Earnings data unavailable"
          trend="Connected teacher data only"
        />
      </div>

      <div className="teacher-dashboard-main-grid">
        <div className="teacher-dashboard-primary-column">
          <section className="teacher-dashboard-panel teacher-dashboard-schedule">
            <div className="teacher-dashboard-section-heading">
              <div>
                <h3>▣ Today&apos;s Teaching Schedule</h3>
              </div>
              <span>{sessions.length} Planned Events</span>
            </div>
            <div className="teacher-dashboard-session-list">
              {sessions.map((session) => (
                <article className="teacher-dashboard-session" key={session.id}>
                  <div className="teacher-dashboard-time">
                    <strong>
                      {new Date(session.startDateTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </strong>
                    <small>
                      {session.endDateTime
                        ? new Date(session.endDateTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </small>
                  </div>
                  <div className="teacher-dashboard-session-body">
                    <div>
                      <span className="teacher-session-state">{session.status}</span>
                    </div>
                    <h4>{session.title}</h4>
                    <p>{session.description || session.location || "Scheduled calendar event"}</p>
                  </div>
                  <div className="teacher-dashboard-session-actions">
                    <button
                      type="button"
                      onClick={() => notify(`${session.title} details opened.`)}
                    >
                      View Details
                    </button>
                    <button type="button" onClick={() => notify(`${session.title} action opened.`)}>
                      Open Event
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="teacher-dashboard-course-spotlight">
            <div className="teacher-dashboard-section-heading">
              <div>
                <h3>Active Courses Spotlight</h3>
                <p>Tracking syllabus progress, student cohorts, and assignment pipelines</p>
              </div>
              <button type="button" onClick={() => onNavigate("courses")}>
                View All ({Math.max(courses.length, 6)}) →
              </button>
            </div>
            <div className="teacher-dashboard-course-grid">
              {courses.slice(0, 3).map((course, index) => (
                <article className="teacher-dashboard-course-card" key={course.id}>
                  <div className={`teacher-dashboard-course-art art-${index}`}>
                    {course.courseThumbnail ? (
                      // Course thumbnails may come from a configured remote media service.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.courseThumbnail} alt="" />
                    ) : (
                      <span>{course.courseName.charAt(0)}</span>
                    )}
                    <b>{course.subject || "Assigned course"}</b>
                  </div>
                  <div className="teacher-dashboard-course-content">
                    <h4>{course.courseName}</h4>
                    <p>
                      {course.courseDescription ||
                        "Build engaging learning experiences for your cohort."}
                    </p>
                    <div className="teacher-dashboard-progress">
                      <div>
                        <span>Curriculum Progress</span>
                        <strong>—</strong>
                      </div>
                      <i>
                        <em style={{ width: "0%" }} />
                      </i>
                    </div>
                    <div className="teacher-dashboard-course-meta">
                      <span>♧ {course.numberOfStudents || 0} Enrolled</span>
                      <small>
                        {course.courseStatus || "Assigned course"} ·{" "}
                        {course.online ? "Online" : "Course service"}
                      </small>
                    </div>
                    <button type="button" onClick={() => onNavigate("courses")}>
                      Open Course Workspace <b>→</b>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="teacher-dashboard-side-column">
          <section className="teacher-dashboard-panel teacher-dashboard-ai-card">
            <div className="teacher-dashboard-side-heading">
              <h3>✦ AI Teaching Assistant</h3>
              <span>GPT-4o Ready</span>
            </div>
            <p>
              Quickly generate quizzes, differentiate instructions, or summarize lecture topics.
            </p>
            <button type="button" onClick={() => onNavigate("assistant")}>
              Generate 5 Calculus Warm-up Questions <b>+</b>
            </button>
            <button type="button" onClick={() => onNavigate("assistant")}>
              Draft Lesson Summary for Lab 3 <b>+</b>
            </button>
            <button type="button" onClick={() => onNavigate("assistant")}>
              Identify Struggling Students <b>+</b>
            </button>
            <label>
              <input placeholder="Ask AI copilot anything..." />
              <button type="button" onClick={() => onNavigate("assistant")}>
                ▷
              </button>
            </label>
          </section>
          <section className="teacher-dashboard-panel teacher-dashboard-alerts">
            <div className="teacher-dashboard-side-heading">
              <h3>Students Needing Attention</h3>
              <span className="alert-count">3 Alerts</span>
            </div>
            {[
              [
                "Alex Turner",
                "AP Calculus BC",
                "Missed last 2 quiz submissions in Calculus.",
                "Submissions",
              ],
              [
                "Maya Patel",
                "Physics Honors",
                "Grade dropped to 72% on Chapter 3 Test.",
                "Grade Drop",
              ],
              [
                "David Kim",
                "Python for Data Science",
                "Requested deadline extension for Lab 2.",
                "Extension",
              ],
            ].map(([name, course, message, tag]) => (
              <article key={name}>
                <div className="teacher-dashboard-alert-avatar">
                  {name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <strong>{name}</strong>
                  <small>{course}</small>
                  <p>{message}</p>
                </div>
                <span>{tag}</span>
                <button type="button" onClick={() => notify(`Follow-up opened for ${name}.`)}>
                  Review →
                </button>
              </article>
            ))}
          </section>
          <section className="teacher-dashboard-panel teacher-dashboard-tasks">
            <div className="teacher-dashboard-side-heading">
              <h3>☷ Teacher Tasks &amp; Deadlines</h3>
              <button type="button" onClick={() => notify("Task calendar opened.")}>
                ◷
              </button>
            </div>
            {[
              "Review Chapter 4 Mid-Term Draft",
              "Grade Python Homework 2",
              "Submit Q3 Attendance Log for Admin Review",
            ].map((task, index) => (
              <label key={task}>
                <input
                  type="checkbox"
                  onChange={() => notify(`${task} marked ${index === 0 ? "complete" : "updated"}.`)}
                />
                <span>
                  {task}
                  <small>
                    {index === 0
                      ? "Due Tomorrow · AP Calculus"
                      : index === 1
                        ? "6 submissions pending grading"
                        : "Due Friday, 5:00 PM"}
                  </small>
                </span>
              </label>
            ))}
            <button type="button" onClick={() => onNavigate("quizzes")}>
              Open Full Gradebook &amp; Tasks ↗
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}

function Kpi({
  icon,
  label,
  value,
  detail,
  trend,
  danger,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
  trend: string;
  danger?: boolean;
}) {
  return (
    <article className="teacher-dashboard-kpi">
      <div>
        <span>{label}</span>
        <b className={danger ? "danger" : ""}>{value}</b>
      </div>
      <small>{detail}</small>
      <em className={danger ? "danger" : ""}>{trend}</em>
      <i>{icon}</i>
    </article>
  );
}

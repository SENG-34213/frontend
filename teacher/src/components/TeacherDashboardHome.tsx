"use client";

import { useState } from "react";
import type { TeacherCourse, TeacherProfile } from "../lib/teacherApi";

type Props = {
  profile: TeacherProfile | null;
  courses: TeacherCourse[];
  onNavigate: (view: "courses" | "quizzes" | "communication" | "assistant") => void;
};

const sessions = [
  {
    time: "10:30",
    end: "11:45 AM",
    label: "AP Calculus BC · Unit 4: Differential Equations",
    detail: "24 Students · Interactive Whiteboard Enabled",
    state: "Starts in 25m",
    action: "Join Classroom",
    live: true,
  },
  {
    time: "02:00",
    end: "03:00 PM",
    label: "Linear Algebra Fundamentals · Alex Turner",
    detail: "Individual Session · Matrix Inversion Proofs",
    state: "Scheduled",
    action: "Lesson Notes",
    live: false,
  },
  {
    time: "04:30",
    end: "05:45 PM",
    label: "Intro to Python for Data Science · Lab 3",
    detail: "18 Students · Jupyter Hub Sync Active",
    state: "Scheduled",
    action: "Prepare Materials",
    live: false,
  },
];

export default function TeacherDashboardHome({ profile, courses, onNavigate }: Props) {
  const [notice, setNotice] = useState("");
  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Teacher";
  const totalStudents = courses.reduce((sum, course) => sum + (course.numberOfStudents || 0), 0);

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
      <div className="teacher-dashboard-welcome">
        <div>
          <span className="teacher-dashboard-kicker">Teacher workspace · Thursday, Oct 24</span>
          <h2 id="teacher-dashboard-title">
            Good morning, {displayName} <span aria-hidden="true">👋</span>
          </h2>
          <p>You have 3 teaching sessions and 14 assignments to review today.</p>
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
          value={`${courses.length || 6} Active`}
          detail={`${Math.max(courses.length, 4)} cohort, 2 self-paced`}
          trend="↗ +1 from last term"
        />
        <Kpi
          icon="♧"
          label="Enrolled Students"
          value={`${totalStudents || 148} Students`}
          detail="Across 3 grade levels"
          trend="● 94% active participation"
        />
        <Kpi
          icon="▣"
          label="Today's Sessions"
          value="3 Sessions"
          detail="3.5 instructional hours"
          trend="● First starts in 25 min"
        />
        <Kpi
          icon="☷"
          label="Pending Reviews"
          value="14 Items"
          detail="8 quizzes, 6 assignments"
          trend="◉ 4 due today"
          danger
        />
        <Kpi
          icon="▤"
          label="Monthly Earnings"
          value="$4,850"
          detail="Target: $5,200"
          trend="↗ +12% vs last month"
        />
      </div>

      <div className="teacher-dashboard-main-grid">
        <div className="teacher-dashboard-primary-column">
          <section className="teacher-dashboard-panel teacher-dashboard-schedule">
            <div className="teacher-dashboard-section-heading">
              <div>
                <h3>▣ Today&apos;s Teaching Schedule</h3>
              </div>
              <span>3 Planned Classes</span>
            </div>
            <div className="teacher-dashboard-session-list">
              {sessions.map((session) => (
                <article
                  className={`teacher-dashboard-session ${session.live ? "live" : ""}`}
                  key={session.label}
                >
                  <div className="teacher-dashboard-time">
                    <strong>{session.time}</strong>
                    <small>{session.end}</small>
                  </div>
                  <div className="teacher-dashboard-session-body">
                    <div>
                      <span className="teacher-session-state">{session.state}</span>
                      {session.live && (
                        <span className="teacher-session-ready">Live Room Ready</span>
                      )}
                    </div>
                    <h4>{session.label}</h4>
                    <p>{session.detail}</p>
                  </div>
                  <div className="teacher-dashboard-session-actions">
                    <button type="button" onClick={() => notify(`${session.label} roster opened.`)}>
                      {session.live ? "View Roster" : "Reschedule"}
                    </button>
                    <button
                      type="button"
                      className={session.live ? "primary" : ""}
                      onClick={() => notify(`${session.action} opened.`)}
                    >
                      {session.live ? "▣ " : ""}
                      {session.action}
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
              {(courses.length
                ? courses.slice(0, 3)
                : [
                    {
                      id: "calc",
                      courseName: "AP Calculus BC",
                      courseDescription: "Advanced placement college credit track",
                      numberOfStudents: 32,
                    },
                    {
                      id: "physics",
                      courseName: "Physics Honors: Mechanics",
                      courseDescription: "Kinematics, Newton&apos;s Laws & Energy",
                      numberOfStudents: 28,
                    },
                    {
                      id: "linear",
                      courseName: "Linear Algebra & Matrices",
                      courseDescription: "Vector spaces, eigenvalues, transforms",
                      numberOfStudents: 18,
                    },
                  ]
              ).map((course, index) => (
                <article className="teacher-dashboard-course-card" key={course.id}>
                  <div className={`teacher-dashboard-course-art art-${index}`}>
                    {course.courseThumbnail ? (
                      // Course thumbnails may come from a configured remote media service.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.courseThumbnail} alt="" />
                    ) : (
                      <span>{course.courseName.charAt(0)}</span>
                    )}
                    <b>{index === 0 ? "Grade 12" : index === 1 ? "Grade 11" : "College Prep"}</b>
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
                        <strong>{78 - index * 16}%</strong>
                      </div>
                      <i>
                        <em style={{ width: `${78 - index * 16}%` }} />
                      </i>
                    </div>
                    <div className="teacher-dashboard-course-meta">
                      <span>♧ {course.numberOfStudents || 0} Enrolled</span>
                      <small>
                        {index === 0
                          ? "◷ Next lesson tomorrow at 9:00 AM"
                          : index === 1
                            ? "◉ Mechanics Quiz due tonight"
                            : "☑ 3 pending homework submissions"}
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

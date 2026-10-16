"use client";

import { useEffect, useState } from "react";
import {
  teacherApi,
  type CalendarEvent,
  type CalendarEventType,
  type CalendarVisibility,
  type TeacherCourse,
} from "../lib/teacherApi";

const newEvent = {
  title: "",
  description: "",
  eventType: "MEETING" as CalendarEventType,
  startDateTime: "",
  endDateTime: "",
  allDay: false,
  visibility: "COURSE" as CalendarVisibility,
  location: "",
};

function displayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export default function TeacherCalendarWorkspace({ courses }: { courses: TeacherCourse[] }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [form, setForm] = useState(newEvent);
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadEvents = async () => {
    setError("");
    try {
      setEvents(await teacherApi.upcomingCalendarEvents(30));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load calendar events.");
    }
  };
  useEffect(() => {
    void loadEvents();
  }, []);
  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(success);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "The calendar request could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="teacher-calendar-workspace">
      <div className="teacher-sample-heading">
        <div>
          <span className="teacher-kicker">TEACHER PORTAL / CALENDAR</span>
          <h2>Calendar</h2>
          <p>See upcoming course activity and create calendar events for your students.</p>
        </div>
        <button type="button" className="teacher-sample-primary" onClick={() => void loadEvents()}>
          Refresh calendar
        </button>
      </div>
      {error && <div className="teacher-inline-error">{error}</div>}
      {notice && <div className="teacher-inline-success">{notice}</div>}
      <div className="teacher-calendar-grid">
        <section className="teacher-assessment-card">
          <div className="teacher-section-heading">
            <div>
              <span className="teacher-kicker">UPCOMING</span>
              <h3>Events</h3>
            </div>
            <span>{events.length}</span>
          </div>
          <div className="teacher-calendar-list">
            {events.map((event) => (
              <article className="teacher-calendar-event" key={event.id}>
                <div>
                  <span className={`teacher-calendar-type ${event.eventType.toLowerCase()}`}>
                    {event.eventType}
                  </span>
                  <h4>{event.title}</h4>
                  <p>
                    {displayDate(event.startDateTime)}
                    {event.endDateTime ? ` â€“ ${displayDate(event.endDateTime)}` : ""}
                  </p>
                  {event.location && <small>{event.location}</small>}
                </div>
                <div className="teacher-calendar-event-actions">
                  {event.canEdit && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          title: event.title,
                          description: event.description || "",
                          eventType: event.eventType,
                          startDateTime: event.startDateTime.slice(0, 16),
                          endDateTime: event.endDateTime?.slice(0, 16) || "",
                          allDay: event.allDay,
                          visibility: event.visibility,
                          location: event.location || "",
                        })
                      }
                    >
                      Edit
                    </button>
                  )}
                  {event.canCancel && (
                    <button
                      type="button"
                      className="danger"
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const cancelled = await teacherApi.cancelCalendarEvent(event.id);
                          setEvents((current) =>
                            current.map((item) => (item.id === cancelled.id ? cancelled : item)),
                          );
                        }, "Calendar event cancelled.")
                      }
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </article>
            ))}
            {!events.length && (
              <p className="teacher-side-muted">
                No upcoming events are available for your courses.
              </p>
            )}
          </div>
        </section>
        <section className="teacher-assessment-card">
          <div className="teacher-section-heading">
            <div>
              <span className="teacher-kicker">EVENT MANAGEMENT</span>
              <h3>Create event</h3>
            </div>
          </div>
          <form
            className="teacher-assessment-form"
            onSubmit={(event) => {
              event.preventDefault();
              const payload = {
                ...form,
                courseId: form.visibility === "COURSE" ? courseId : undefined,
                endDateTime: form.allDay || !form.endDateTime ? undefined : form.endDateTime,
              };
              void run(async () => {
                const saved = await teacherApi.createCalendarEvent(payload);
                setEvents((current) =>
                  [...current, saved].sort((a, b) =>
                    a.startDateTime.localeCompare(b.startDateTime),
                  ),
                );
                setForm(newEvent);
              }, "Calendar event created.");
            }}
          >
            <input
              required
              placeholder="Event title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <div className="teacher-form-row">
              <select
                value={form.eventType}
                onChange={(event) =>
                  setForm({ ...form, eventType: event.target.value as CalendarEventType })
                }
              >
                <option>MEETING</option>
                <option>CLASS</option>
                <option>EXAM</option>
                <option>ASSIGNMENT</option>
                <option>QUIZ</option>
                <option>HOLIDAY</option>
                <option>ADMIN</option>
                <option>CUSTOM</option>
              </select>
              <select
                value={form.visibility}
                onChange={(event) =>
                  setForm({ ...form, visibility: event.target.value as CalendarVisibility })
                }
              >
                <option>COURSE</option>
                <option>PRIVATE</option>
                <option>ROLE</option>
                <option>GLOBAL</option>
              </select>
              {form.visibility === "COURSE" && (
                <select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <label className="teacher-calendar-checkbox">
              <input
                type="checkbox"
                checked={form.allDay}
                onChange={(event) => setForm({ ...form, allDay: event.target.checked })}
              />{" "}
              All-day event
            </label>
            <div className="teacher-form-row">
              <input
                required
                type="datetime-local"
                value={form.startDateTime}
                onChange={(event) => setForm({ ...form, startDateTime: event.target.value })}
              />
              <input
                type="datetime-local"
                disabled={form.allDay}
                value={form.endDateTime}
                onChange={(event) => setForm({ ...form, endDateTime: event.target.value })}
              />
            </div>
            <input
              placeholder="Location (optional)"
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
            />
            <button disabled={busy || !courses.length}>Create calendar event</button>
          </form>
          <p className="teacher-calendar-note">
            Events projected from attendance, exams, quizzes, and assignments remain managed by
            their source service.
          </p>
        </section>
      </div>
    </section>
  );
}

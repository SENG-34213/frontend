"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Icon } from "./Icon";

type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  eventType?: string;
  startDateTime: string;
  endDateTime?: string;
  allDay?: boolean;
  visibility?: string;
  targetRole?: string;
  courseId?: string;
  status?: string;
  location?: string;
  canEdit?: boolean;
  canCancel?: boolean;
};
type Course = { id: string; courseName: string };
type Session = CalendarEvent & {
  day: number;
  start: string;
  end: string;
  tone: "purple" | "green" | "amber" | "red";
};
const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const times = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];
function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}
function startOfWeek(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}
function time(value?: string) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "09:00 AM";
}
function toSession(event: CalendarEvent, weekStart: Date): Session {
  const kind = String(event.eventType || "CLASS").toUpperCase();
  const eventDate = new Date(event.startDateTime);
  const day =
    Math.floor(
      (new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()).getTime() -
        weekStart.getTime()) /
        86400000,
    ) + 1;
  return {
    ...event,
    day,
    start: time(event.startDateTime),
    end: time(event.endDateTime),
    tone:
      event.status === "CANCELLED"
        ? "red"
        : kind === "EXAM"
          ? "amber"
          : kind === "CLASS" || kind === "ATTENDANCE"
            ? "purple"
            : "green",
  };
}
function responseList(payload: unknown): CalendarEvent[] {
  if (Array.isArray(payload)) return payload as CalendarEvent[];
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { events?: unknown[] }).events)
  )
    return (payload as { events: CalendarEvent[] }).events;
  return [];
}

export function CalendarWorkspace({
  apiUrl,
  authenticated,
  courses = [],
}: {
  apiUrl: string;
  authenticated: boolean;
  courses?: Course[];
}) {
  const [events, setEvents] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [view, setView] = useState<"Week" | "Day" | "List">("Week");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const base = apiUrl.replace(/\/$/, "");
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekEnd = useMemo(() => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + 7);
    return date;
  }, [weekStart]);
  const request = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const token = sessionStorage.getItem("mentify_access_token") || "";
      const response = await fetch(`${base}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init.headers || {}),
        },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          body.message || body.error || `Calendar service returned ${response.status}.`,
        );
      return (body.data ?? body) as unknown;
    },
    [base],
  );
  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    const start = encodeURIComponent(weekStart.toISOString());
    const end = encodeURIComponent(weekEnd.toISOString());
    void request(`/api/v1/calendar/events?start=${start}&end=${end}`)
      .then((payload) => {
        if (!cancelled)
          setEvents(responseList(payload).map((event) => toSession(event, weekStart)));
      })
      .catch((caught) => {
        if (!cancelled)
          setError(caught instanceof Error ? caught.message : "Could not load calendar events.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authenticated, request, weekStart, weekEnd, reloadKey]);
  const visible = useMemo(
    () =>
      events.filter(
        (event) =>
          (filter === "ALL" ||
            (filter === "PENDING" && event.tone === "amber") ||
            (filter === "CANCELLED" && event.status === "CANCELLED")) &&
          (view !== "Day" ||
            event.day ===
              Math.floor((selectedDate.getTime() - weekStart.getTime()) / 86400000) + 1),
      ),
    [events, filter, selectedDate, view, weekStart],
  );
  const labels = useMemo(
    () =>
      days.map((label, index) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + index);
        return { label, date: date.getDate(), iso: dateOnly(date) };
      }),
    [weekStart],
  );
  async function saveEvent(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(formEvent.currentTarget);
    const allDay = form.get("allDay") === "on";
    const date = String(form.get("date") || dateOnly(selectedDate));
    const visibility = String(form.get("visibility") || "GLOBAL");
    const payload = {
      title: String(form.get("title") || "").trim(),
      description: String(form.get("description") || "").trim(),
      eventType: String(form.get("eventType") || "CLASS"),
      startDateTime: allDay ? `${date}T00:00:00` : `${date}T${form.get("start")}:00`,
      endDateTime: allDay ? `${date}T23:59:59` : `${date}T${form.get("end")}:00`,
      allDay,
      visibility,
      targetRole: String(form.get("targetRole") || "TEACHER"),
      courseId: visibility === "COURSE" ? String(form.get("courseId") || "") : undefined,
      location: String(form.get("location") || "").trim(),
    };
    try {
      await request(
        editing
          ? `/api/v1/calendar/events/${encodeURIComponent(editing.id)}`
          : "/api/v1/calendar/events",
        { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) },
      );
      setShowSchedule(false);
      setEditing(null);
      setReloadKey((value) => value + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this event.");
    } finally {
      setSaving(false);
    }
  }
  async function cancel(event: Session) {
    if (!event.id || event.canCancel === false || !window.confirm(`Cancel “${event.title}”?`))
      return;
    setSaving(true);
    setError("");
    try {
      await request(`/api/v1/calendar/events/${encodeURIComponent(event.id)}/cancel`, {
        method: "POST",
      });
      setReloadKey((value) => value + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not cancel this session.");
    } finally {
      setSaving(false);
    }
  }
  const create = () => {
    setEditing(null);
    setShowSchedule(true);
  };
  const edit = (event: Session) => {
    setEditing(event);
    setShowSchedule(true);
  };
  return (
    <section className="calendar-workspace" aria-labelledby="calendar-title">
      <div className="calendar-conflict-banner">
        <span>
          <Icon name="alert" size={16} />
        </span>
        <div>
          <strong>
            {error ? "Calendar service connection needs attention" : "Calendar service connected"}
          </strong>
          <small>
            {error ||
              (loading
                ? "Syncing selected dates…"
                : `${events.length} events loaded for ${weekStart.toLocaleDateString()} – ${new Date(weekEnd.getTime() - 86400000).toLocaleDateString()}.`)}
          </small>
        </div>
        <button type="button" onClick={create}>
          Schedule Session
        </button>
        <button
          type="button"
          className="dismiss-conflict"
          onClick={() => setReloadKey((value) => value + 1)}
        >
          Refresh
        </button>
      </div>
      <div className="calendar-layout">
        <main className="calendar-main">
          <header className="calendar-hero">
            <div>
              <span className="catalog-kicker">
                LEARNING OPS <b>•</b> SESSIONS &amp; CALENDAR
              </span>
              <h2 id="calendar-title">
                Sessions &amp; Academic
                <br />
                Calendar
              </h2>
              <p>
                Monitor live mentoring sessions, manage cohort timetables, resolve schedule
                conflicts, and dispatch substitute teachers in real time.
              </p>
            </div>
            <div className="calendar-controls">
              <div className="calendar-date-control">
                <button
                  type="button"
                  onClick={() => setSelectedDate((date) => new Date(date.getTime() - 7 * 86400000))}
                >
                  ‹
                </button>
                <span>
                  {weekStart.toLocaleDateString([], { month: "short", day: "numeric" })} –{" "}
                  {new Date(weekEnd.getTime() - 86400000).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDate((date) => new Date(date.getTime() + 7 * 86400000))}
                >
                  ›
                </button>
                <button type="button" onClick={() => setSelectedDate(new Date())}>
                  Today
                </button>
              </div>
              <div className="calendar-view-tabs">
                {(["Week", "Day", "List"] as const).map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={view === item ? "active" : ""}
                    onClick={() => setView(item)}
                  >
                    {item}
                  </button>
                ))}
                <button
                  type="button"
                  className="calendar-filter-button"
                  onClick={() =>
                    setFilter(
                      filter === "ALL" ? "PENDING" : filter === "PENDING" ? "CANCELLED" : "ALL",
                    )
                  }
                >
                  <Icon name="settings" size={12} /> {filter === "ALL" ? "Filters" : filter}
                </button>
              </div>
              <button type="button" className="primary-button" onClick={create}>
                <Icon name="plus" size={14} /> Schedule Session
              </button>
            </div>
          </header>
          <div className="calendar-metrics">
            <Metric
              icon="calendar"
              label="SELECTED RANGE"
              value={String(events.length)}
              note="events"
              detail="Calendar API results"
              tone="green"
            />
            <Metric
              icon="check"
              label="SCHEDULED"
              value={String(events.filter((event) => event.status !== "CANCELLED").length)}
              note="events"
              detail="Ready for delivery"
              tone="green"
            />
            <Metric
              icon="sparkles"
              label="PENDING REVIEW"
              value={String(events.filter((event) => event.tone === "amber").length)}
              note="events"
              detail="Review before dispatch"
              tone="purple"
            />
            <Metric
              icon="alert"
              label="CANCELLED"
              value={String(events.filter((event) => event.status === "CANCELLED").length)}
              note="events"
              detail="Backend status"
              tone="amber"
            />
          </div>
          {view === "List" ? (
            <div className="calendar-board calendar-list-view">
              {visible.map((event) => (
                <div className="calendar-list-row" key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <small>
                      {new Date(event.startDateTime).toLocaleString()} ·{" "}
                      {event.eventType || "EVENT"}
                    </small>
                  </div>
                  <span
                    className={`calendar-list-status ${event.status === "CANCELLED" ? "cancelled" : "scheduled"}`}
                  >
                    {event.status || "SCHEDULED"}
                  </span>
                  <button type="button" onClick={() => edit(event)}>
                    Edit
                  </button>
                </div>
              ))}
              {!loading && !visible.length && (
                <div className="calendar-empty-grid">No events found for the selected dates.</div>
              )}
            </div>
          ) : (
            <div className="calendar-board">
              <div className="calendar-day-head">
                <span className="calendar-timezone">LOCAL TIME</span>
                {labels.map((day) => (
                  <button
                    type="button"
                    key={day.iso}
                    className={day.iso === dateOnly(selectedDate) ? "selected" : ""}
                    onClick={() => setSelectedDate(new Date(`${day.iso}T12:00:00`))}
                  >
                    <small>{day.label}</small>
                    <strong>{day.date}</strong>
                  </button>
                ))}
              </div>
              <div className="calendar-grid">
                {times.map((slot) => (
                  <div className="calendar-time-row" key={slot}>
                    <span>{slot}</span>
                    {days.map((day) => (
                      <i key={`${day}-${slot}`} />
                    ))}
                  </div>
                ))}
                {visible.map((event) => (
                  <CalendarEvent key={event.id} session={event} onCancel={cancel} onEdit={edit} />
                ))}
                {!loading && !visible.length && (
                  <div className="calendar-empty-grid">No events found for the selected dates.</div>
                )}
                <div className="calendar-now-line">
                  <b>NOW</b>
                  <i />
                </div>
              </div>
              <footer className="calendar-board-footer">
                <span>
                  <i className="legend-dot scheduled" /> Scheduled
                </span>
                <span>
                  <i className="legend-dot pending" /> Pending review
                </span>
                <span>
                  <i className="legend-dot conflict" /> Cancelled
                </span>
              </footer>
            </div>
          )}
        </main>
        <aside className="calendar-side-panel">
          <section className="broadcast-card">
            <div className="broadcast-card-top">
              <span>
                <i /> API CONNECTED
              </span>
              <small>{saving ? "Syncing…" : "Live"}</small>
            </div>
            <h3>Calendar Service</h3>
            <p>Events are loaded for the selected date range and authorized by the backend.</p>
            <div className="room-card">
              <small>ENDPOINTS</small>
              <strong>/api/v1/calendar/events</strong>
              <dl>
                <dt>Selected range</dt>
                <dd>
                  GET <b>Authorized</b>
                </dd>
                <dt>Create / edit</dt>
                <dd>
                  POST / PUT <b>Authorized</b>
                </dd>
                <dt>Cancel event</dt>
                <dd>
                  POST <b>Authorized</b>
                </dd>
              </dl>
            </div>
            <span className="side-kicker">AVAILABLE ACTIONS</span>
            <button type="button" className="observer-button" onClick={create}>
              ＋ Schedule New Event
            </button>
            <button
              type="button"
              className="reassign-button"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              ↻ Refresh Selected Dates
            </button>
          </section>
          <section className="rooms-card">
            <strong>Authorization</strong>
            <small>JWT session</small>
            <div>
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <span>Backend authorization enforced</span>
            </div>
          </section>
        </aside>
      </div>
      {showSchedule && (
        <EventModal
          event={editing}
          defaultDate={dateOnly(selectedDate)}
          courses={courses}
          saving={saving}
          onClose={() => {
            setShowSchedule(false);
            setEditing(null);
          }}
          onSubmit={saveEvent}
        />
      )}
    </section>
  );
}
function Metric({
  icon,
  label,
  value,
  note,
  detail,
  tone,
}: {
  icon: "calendar" | "check" | "sparkles" | "alert";
  label: string;
  value: string;
  note: string;
  detail: string;
  tone: string;
}) {
  return (
    <div className={`calendar-metric ${tone}`}>
      <span>{label}</span>
      <strong>
        {value}
        <small>{note}</small>
      </strong>
      <p>
        <Icon name={icon} size={12} /> {detail}
      </p>
    </div>
  );
}
function CalendarEvent({
  session,
  onCancel,
  onEdit,
}: {
  session: Session;
  onCancel: (session: Session) => void;
  onEdit: (session: Session) => void;
}) {
  const top = session.allDay ? 8 : Math.max(8, times.indexOf(session.start) * 10);
  const eventType = String(session.eventType || "CUSTOM").toLowerCase();
  return (
    <article
      className={`calendar-event ${session.tone} event-${eventType}`}
      style={{ top: `${top}%`, left: `calc(${(session.day - 1) * 14.28}% + 8px)`, height: 88 }}
    >
      <small>{session.allDay ? "ALL DAY" : session.start}</small>
      <strong>{session.status || "SCHEDULED"}</strong>
      <b>{session.title}</b>
      <span>
        {session.description || session.location || session.eventType || "Calendar event"}
      </span>
      {session.canEdit !== false && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(session);
          }}
          aria-label={`Edit ${session.title}`}
        >
          ✎
        </button>
      )}
      {session.canCancel !== false && session.status !== "CANCELLED" && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onCancel(session);
          }}
          aria-label={`Cancel ${session.title}`}
        >
          ×
        </button>
      )}
    </article>
  );
}
function EventModal({
  event,
  defaultDate,
  courses,
  saving,
  onClose,
  onSubmit,
}: {
  event: Session | null;
  defaultDate: string;
  courses: Course[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const start = event?.startDateTime ? new Date(event.startDateTime) : null;
  const end = event?.endDateTime ? new Date(event.endDateTime) : null;
  const initialDate = start && !Number.isNaN(start.getTime()) ? dateOnly(start) : defaultDate;
  const initialStart =
    start && !Number.isNaN(start.getTime()) ? start.toTimeString().slice(0, 5) : "09:00";
  const initialEnd = end && !Number.isNaN(end.getTime()) ? end.toTimeString().slice(0, 5) : "10:00";
  return (
    <div
      className="calendar-modal-backdrop"
      role="presentation"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) onClose();
      }}
    >
      <form
        className="calendar-schedule-modal"
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-title"
      >
        <header>
          <div>
            <span className="catalog-kicker">CALENDAR SERVICE</span>
            <h3 id="schedule-title">{event ? "Edit calendar event" : "Schedule a session"}</h3>
            <p>Changes are validated and authorized by the calendar service.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <label>
          Title
          <input
            name="title"
            required
            defaultValue={event?.title || ""}
            placeholder="e.g. AP Calculus review"
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            defaultValue={event?.description || ""}
            placeholder="Optional event details"
          />
        </label>
        <div className="calendar-form-grid">
          <label>
            Date
            <input name="date" type="date" required defaultValue={initialDate} />
          </label>
          <label>
            Event type
            <select name="eventType" defaultValue={event?.eventType || "CLASS"}>
              <option>CLASS</option>
              <option>MEETING</option>
              <option>EXAM</option>
              <option>QUIZ</option>
              <option>ATTENDANCE</option>
              <option>ADMIN</option>
              <option>CUSTOM</option>
            </select>
          </label>
          <label>
            Start
            <input name="start" type="time" required={!event?.allDay} defaultValue={initialStart} />
          </label>
          <label>
            End
            <input name="end" type="time" required={!event?.allDay} defaultValue={initialEnd} />
          </label>
        </div>
        <label className="calendar-checkbox">
          <input name="allDay" type="checkbox" defaultChecked={event?.allDay} /> All-day event
        </label>
        <div className="calendar-form-grid">
          <label>
            Visibility
            <select name="visibility" defaultValue={event?.visibility || "GLOBAL"}>
              <option>GLOBAL</option>
              <option>ROLE</option>
              <option>COURSE</option>
              <option>PRIVATE</option>
            </select>
          </label>
          <label>
            Target role
            <select name="targetRole" defaultValue={event?.targetRole || "TEACHER"}>
              <option>TEACHER</option>
              <option>STUDENT</option>
              <option>ADMIN</option>
            </select>
          </label>
        </div>
        <label>
          Course{" "}
          {courses.length ? (
            <select name="courseId" defaultValue={event?.courseId || ""}>
              <option value="">Select course (when visibility is COURSE)</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName}
                </option>
              ))}
            </select>
          ) : (
            <input
              name="courseId"
              defaultValue={event?.courseId || ""}
              placeholder="Optional course ID"
            />
          )}
        </label>
        <label>
          Location
          <input
            name="location"
            defaultValue={event?.location || ""}
            placeholder="Virtual room or classroom"
          />
        </label>
        <footer>
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving…" : event ? "Save changes" : "Create event"}
          </button>
        </footer>
      </form>
    </div>
  );
}

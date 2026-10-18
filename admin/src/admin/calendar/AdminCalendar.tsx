import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Filter,
  X,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { AcademicEvent, Course } from "../types";
import type {
  CalendarEventFilters,
  CalendarEventRequest,
  CalendarEventType,
} from "../api/calendarApi";

interface AdminCalendarProps {
  events: AcademicEvent[];
  courses: Course[];
  onAddEvent: (event: CalendarEventRequest) => Promise<void>;
  onUpdateEvent: (eventId: string, event: CalendarEventRequest) => Promise<void>;
  onCancelEvent: (eventId: string) => Promise<void>;
  onFilterEvents: (filters: CalendarEventFilters, start: Date, end: Date) => Promise<void>;
}

export const AdminCalendar: React.FC<AdminCalendarProps> = ({
  events,
  courses,
  onAddEvent,
  onUpdateEvent,
  onCancelEvent,
  onFilterEvents,
}) => {
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("month");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [displayMonth, setDisplayMonth] = useState(() => new Date(2026, 9, 1));
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);

  // New Event form
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "EXAM" as CalendarEventType,
    startDate: "2026-10-26",
    startTime: "10:00",
    endDate: "2026-10-26",
    endTime: "12:00",
    allDay: false,
    location: "",
    courseId: "",
    visibility: "GLOBAL" as "PRIVATE" | "COURSE" | "ROLE" | "GLOBAL",
    targetRole: "" as "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN" | "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openEventForm = (event?: AcademicEvent) => {
    setFormError("");
    setEditingEvent(event || null);
    if (event) {
      const start = event.startDateTime || `${event.date}T10:00`;
      const end = event.endDateTime || `${event.date}T12:00`;
      setNewEvent({
        title: event.title,
        description: event.description || "",
        eventType: (event.eventType || "CUSTOM") as CalendarEventType,
        startDate: start.slice(0, 10),
        startTime: start.slice(11, 16),
        endDate: end.slice(0, 10),
        endTime: end.slice(11, 16),
        allDay: Boolean(event.allDay),
        location: event.location === "Not specified" ? "" : event.location,
        courseId: event.courseId || "",
        visibility: event.visibility || "GLOBAL",
        targetRole: event.targetRole || "",
      });
    }
    setIsAddEventOpen(true);
    setSelectedEvent(null);
  };

  // Filtering is performed by the calendar service; keep this view as a direct rendering of its response.
  const filteredEvents = events;

  useEffect(() => {
    const start = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
    const end = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1);
    void onFilterEvents(
      {
        type: typeFilter === "ALL" ? undefined : (typeFilter as CalendarEventType),
        courseId: courseFilter === "ALL" ? undefined : courseFilter,
        status: statusFilter === "ALL" ? undefined : (statusFilter as "SCHEDULED" | "CANCELLED"),
      },
      start,
      end,
    );
  }, [courseFilter, displayMonth, onFilterEvents, statusFilter, typeFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return setFormError("Event title is required.");
    if (!newEvent.allDay && !newEvent.endTime) return setFormError("End time is required.");
    if (newEvent.visibility === "COURSE" && !newEvent.courseId) {
      return setFormError("Course ID is required for course visibility.");
    }
    if (newEvent.visibility === "ROLE" && !newEvent.targetRole) {
      return setFormError("Target role is required for role visibility.");
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      const request: CalendarEventRequest = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || undefined,
        eventType: newEvent.eventType,
        startDateTime: `${newEvent.startDate}T${newEvent.startTime}`,
        endDateTime: newEvent.allDay ? null : `${newEvent.endDate}T${newEvent.endTime}`,
        allDay: newEvent.allDay,
        courseId: newEvent.courseId || null,
        visibility: newEvent.visibility,
        targetRole: newEvent.targetRole || null,
        location: newEvent.location.trim() || undefined,
      };
      if (editingEvent) await onUpdateEvent(editingEvent.id, request);
      else await onAddEvent(request);
      setIsAddEventOpen(false);
      setEditingEvent(null);
      setNewEvent({
        title: "",
        description: "",
        eventType: "EXAM",
        startDate: "2026-10-26",
        startTime: "10:00",
        endDate: "2026-10-26",
        endTime: "12:00",
        allDay: false,
        location: "",
        courseId: "",
        visibility: "GLOBAL",
        targetRole: "",
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create calendar event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case "EXAM":
        return "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "DEADLINE":
        return "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "QUIZ":
        return "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "SESSION":
        return "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
      case "CLASS":
      default:
        return "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    }
  };

  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const startDayOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const dayIndex = index - startDayOffset + 1;
    const date = new Date(year, month, dayIndex);
    return {
      dayNumber:
        dayIndex < 1
          ? previousMonthDays + dayIndex
          : dayIndex > daysInMonth
            ? dayIndex - daysInMonth
            : dayIndex,
      isCurrentMonth: dayIndex >= 1 && dayIndex <= daysInMonth,
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    };
  });
  const monthLabel = displayMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const monthOptions = Array.from({ length: 12 }, (_, index) =>
    new Date(2024, index, 1).toLocaleDateString(undefined, { month: "long" }),
  );
  const yearOptions = Array.from({ length: 9 }, (_, index) => 2022 + index);
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Operations Calendar"
        description="Master timetable for examinations, course lectures, assignment cutoff windows, and faculty sessions."
        breadcrumbs={[{ label: "Admin" }, { label: "Platform Operations" }, { label: "Calendar" }]}
        actions={
          <button
            onClick={() => setIsAddEventOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Event</span>
          </button>
        }
      />

      {/* Calendar Controls Bar */}
      <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <h2 className="sr-only">{monthLabel}</h2>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setDisplayMonth(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDisplayMonth(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <select
              aria-label="Select calendar month"
              value={month}
              onChange={(event) => setDisplayMonth(new Date(year, Number(event.target.value), 1))}
              className="max-w-[132px] sm:max-w-none px-2.5 py-2 sm:py-1.5 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {monthOptions.map((monthName, index) => (
                <option key={monthName} value={index}>
                  {monthName}
                </option>
              ))}
            </select>
            <select
              aria-label="Select calendar year"
              value={year}
              onChange={(event) => setDisplayMonth(new Date(Number(event.target.value), month, 1))}
              className="w-[92px] px-2.5 py-2 sm:py-1.5 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {yearOptions.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>
          <span className="hidden sm:inline text-xs font-medium text-slate-400 whitespace-nowrap">
            Term 1 · Week 7
          </span>
        </div>

        {/* View Switcher and Type Filter */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:justify-end items-center gap-2 w-full lg:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto min-w-0 px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Event Types</option>
            <option value="EXAM">Examinations</option>
            <option value="ASSIGNMENT">Deadlines</option>
            <option value="CLASS">Classes</option>
            <option value="MEETING">Meetings</option>
            <option value="ADMIN">Administrative</option>
            <option value="HOLIDAY">Holidays</option>
            <option value="CUSTOM">Custom</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full sm:w-auto min-w-0 px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto min-w-0 px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs w-full sm:w-auto overflow-x-auto">
            {(["month", "week", "day", "agenda"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 sm:flex-none px-2 sm:px-2.5 py-1.5 sm:py-1 font-medium rounded-md capitalize transition-colors ${
                  view === v
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Month Grid View */}
      {view === "month" && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 py-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
            {calendarDays.map((cell, idx) => {
              const dayEvents = cell.isCurrentMonth
                ? filteredEvents.filter((e) => e.date === cell.date)
                : [];
              const isToday = cell.isCurrentMonth && cell.date === todayString;

              return (
                <div
                  key={idx}
                  className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors ${
                    !cell.isCurrentMonth
                      ? "bg-slate-50/40 dark:bg-slate-900/40 text-slate-300 dark:text-slate-600"
                      : isToday
                        ? "bg-indigo-50/20 dark:bg-indigo-950/20"
                        : "hover:bg-slate-50/40 dark:hover:bg-slate-800/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        isToday
                          ? "w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"
                          : cell.isCurrentMonth
                            ? "text-slate-800 dark:text-slate-200"
                            : "text-slate-400"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Day Events Pills */}
                  <div className="space-y-1 mt-1">
                    {dayEvents.map((evt) => (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => setSelectedEvent(evt)}
                        className={`w-full text-left p-1 rounded border text-[10px] font-medium line-clamp-1 transition-all hover:scale-[1.02] ${getEventBadgeClass(
                          evt.type,
                        )}`}
                      >
                        {evt.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda / List View fallback */}
      {view !== "month" && (
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Chronological Agenda & Deadlines
          </h3>
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getEventBadgeClass(
                    evt.type,
                  )}`}
                >
                  {evt.type}
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    {evt.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{evt.date}</span>
                    <span>·</span>
                    <span>{evt.time}</span>
                    <span>·</span>
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Inspect
              </span>
            </div>
          ))}
        </div>
      )}

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border mb-2 ${getEventBadgeClass(
                    selectedEvent.type,
                  )}`}
                >
                  {selectedEvent.type}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                  {selectedEvent.date}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{selectedEvent.location}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {selectedEvent.canEdit && (
                <button
                  onClick={() => openEventForm(selectedEvent)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300"
                >
                  Edit Event
                </button>
              )}
              {selectedEvent.canCancel && selectedEvent.status === "SCHEDULED" && (
                <button
                  onClick={async () => {
                    try {
                      await onCancelEvent(selectedEvent.id);
                      setSelectedEvent(null);
                    } catch (error) {
                      setFormError(
                        error instanceof Error ? error.message : "Unable to cancel event.",
                      );
                    }
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-300"
                >
                  Cancel Event
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE EVENT MODAL */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingEvent ? "Edit Calendar Event" : "Schedule Academic Event"}
              </h3>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Midterm Examination: Mechanics"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Category
                  </label>
                  <select
                    value={newEvent.eventType}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, eventType: e.target.value as CalendarEventType })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="EXAM">Examination</option>
                    <option value="ASSIGNMENT">Assignment Deadline</option>
                    <option value="QUIZ">Quiz Window</option>
                    <option value="CLASS">Class Lecture</option>
                    <option value="MEETING">Meeting</option>
                    <option value="ADMIN">Admin Session</option>
                    <option value="HOLIDAY">Holiday</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Time Window
                  </label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    disabled={newEvent.allDay}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Auditorium B"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newEvent.visibility}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      visibility: e.target.value as typeof newEvent.visibility,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="GLOBAL">Global visibility</option>
                  <option value="PRIVATE">Private</option>
                  <option value="COURSE">Course visibility</option>
                  <option value="ROLE">Role visibility</option>
                </select>
                <select
                  value={newEvent.targetRole}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      targetRole: e.target.value as typeof newEvent.targetRole,
                    })
                  }
                  disabled={newEvent.visibility !== "ROLE"}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">Target role</option>
                  <option value="STUDENT">Students</option>
                  <option value="TEACHER">Teachers</option>
                  <option value="ADMIN">Admins</option>
                  <option value="SUPER_ADMIN">Super admins</option>
                </select>
              </div>

              <select
                value={newEvent.courseId}
                onChange={(e) => setNewEvent({ ...newEvent, courseId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">Course (required for course visibility)</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.code})
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={newEvent.allDay}
                  onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                />
                All-day event
              </label>

              {formError && <p className="text-rose-500">{formError}</p>}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSubmitting ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

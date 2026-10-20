import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  BookOpen,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { CalendarEvent } from "../../types";

export const StudentCalendarView: React.FC = () => {
  const { calendarEvents, navigateToCourseWorkspace, setSelectedAssignmentId, setCurrentView } =
    useStudent();
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedEventType, setSelectedEventType] = useState<string>("All");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const eventTypes = ["All", "CLASS", "ASSIGNMENT_DUE", "QUIZ", "EXAM", "OFFICE_HOURS"];

  const filteredEvents = calendarEvents.filter((e) => {
    return selectedEventType === "All" || e.type === selectedEventType;
  });

  const getEventBadge = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "CLASS":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-900";
      case "ASSIGNMENT_DUE":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900";
      case "QUIZ":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900";
      case "EXAM":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-900";
      case "OFFICE_HOURS":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
    }
  };

  // 35 days calendar grid for October 2026
  const days = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - 3 + 1;
    const isCurrentMonth = dayNum >= 1 && dayNum <= 31;
    const dateStr = `2026-10-${String(Math.max(1, Math.min(31, dayNum))).padStart(2, "0")}`;
    const dayEvents = isCurrentMonth ? filteredEvents.filter((e) => e.date === dateStr) : [];
    return { dayNum, isCurrentMonth, dayEvents, dateStr };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Schedule & Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Timetable for lecture sessions, laboratory consulting hours, homework deadlines, and
            examinations
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900">
          {(["month", "week", "day"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-lg px-3 py-1.5 capitalize transition-colors ${
                viewMode === mode
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Controls & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            October 2026
          </h2>
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous month"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Today
            </button>
            <button
              aria-label="Next month"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Event Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {eventTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedEventType(t)}
              className={`rounded-lg px-2.5 py-1 whitespace-nowrap transition-colors ${
                selectedEventType === t
                  ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid & Upcoming Schedule Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Month Calendar Grid (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 py-2.5">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
            {days.map((d, idx) => (
              <div
                key={idx}
                className={`min-h-[96px] p-2 flex flex-col justify-between transition-colors ${
                  !d.isCurrentMonth
                    ? "bg-slate-50/50 text-slate-300 dark:bg-slate-950/40 dark:text-slate-600"
                    : "bg-white hover:bg-slate-50/40 dark:bg-slate-900 dark:hover:bg-slate-800/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-semibold tabular-nums ${
                      d.dayNum === 17
                        ? "flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white font-bold"
                        : ""
                    }`}
                  >
                    {d.isCurrentMonth ? d.dayNum : ""}
                  </span>
                </div>

                <div className="space-y-1 mt-1">
                  {d.dayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`w-full rounded border px-1.5 py-0.5 text-left text-[10px] font-semibold truncate block transition-transform hover:scale-[1.02] ${getEventBadge(
                        ev.type,
                      )}`}
                    >
                      {ev.startTime}: {ev.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Upcoming Milestones
            </h3>

            <div className="space-y-3">
              {calendarEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="cursor-pointer rounded-xl border border-slate-100 p-3 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700 transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {event.courseCode || "GENERAL"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{event.startTime}</span>
                    <span>·</span>
                    <span>{event.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Event Details"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedEvent.courseCode} · {selectedEvent.type.replace("_", " ")}
                </span>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mt-1">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-slate-400" />
                <span>
                  Date:{" "}
                  {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>
                  Time: {selectedEvent.startTime} – {selectedEvent.endTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>Location: {selectedEvent.location}</span>
              </div>
              <p className="pt-2 text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                {selectedEvent.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              {selectedEvent.type === "CLASS" && (
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    navigateToCourseWorkspace("course-cs301");
                  }}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
                >
                  Join Lecture Workspace
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

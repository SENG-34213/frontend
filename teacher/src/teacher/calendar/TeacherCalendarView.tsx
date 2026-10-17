"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Loader2, MapPin, X } from "lucide-react";
import type { BackendCourse } from "../api/courseApi";
import {
  getCalendarEvents,
  getUpcomingCalendarEvents,
  type BackendCalendarEvent,
} from "../api/calendarApi";

type TeacherCalendarViewProps = { backendCourses: BackendCourse[] };

const eventColors: Record<BackendCalendarEvent["eventType"], string> = {
  CLASS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ASSIGNMENT: "bg-amber-50 text-amber-700 border-amber-200",
  QUIZ: "bg-violet-50 text-violet-700 border-violet-200",
  EXAM: "bg-rose-50 text-rose-700 border-rose-200",
  MEETING: "bg-emerald-50 text-emerald-700 border-emerald-200",
  HOLIDAY: "bg-slate-100 text-slate-700 border-slate-200",
  ADMIN: "bg-sky-50 text-sky-700 border-sky-200",
  CUSTOM: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ATTENDANCE: "bg-orange-50 text-orange-700 border-orange-200",
};

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

function dayKey(value: string) {
  return value.slice(0, 10);
}

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export const TeacherCalendarView: React.FC<TeacherCalendarViewProps> = ({ backendCourses }) => {
  const [month, setMonth] = useState(() => monthStart(new Date()));
  const [courseFilter, setCourseFilter] = useState("all");
  const [events, setEvents] = useState<BackendCalendarEvent[]>([]);
  const [upcoming, setUpcoming] = useState<BackendCalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<BackendCalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<"Month" | "Agenda">("Month");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(
    () => Array.from({ length: monthEnd(month).getDate() }, (_, index) => index + 1),
    [month],
  );
  const firstDayOffset = month.getDay();
  const filteredEvents =
    courseFilter === "all" ? events : events.filter((event) => event.courseId === courseFilter);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    Promise.all([
      getCalendarEvents(
        monthStart(month),
        monthEnd(month),
        courseFilter === "all" ? undefined : courseFilter,
        controller.signal,
      ),
      getUpcomingCalendarEvents(20, controller.signal),
    ])
      .then(([monthEvents, upcomingEvents]) => {
        if (controller.signal.aborted) return;
        setEvents(monthEvents);
        setUpcoming(upcomingEvents);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Calendar events failed to load.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [courseFilter, month]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Faculty Academic Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View course schedules, upcoming events, and academic commitments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg"
          >
            <option value="all">All courses</option>
            {backendCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName}
              </option>
            ))}
          </select>
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            {(["Month", "Agenda"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md ${viewMode === mode ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
      {error && (
        <div className="px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
          <button onClick={() => setMonth(new Date(month))} className="ml-3 underline">
            Retry
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900">
                {month.toLocaleDateString([], { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMonth(monthStart(new Date()))}
                className="px-2 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded"
              >
                Today
              </button>
              <button
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
          </div>
          {viewMode === "Month" ? (
            <>
              <div className="grid grid-cols-7 text-center py-2 bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[480px]">
                {Array.from({ length: firstDayOffset }).map((_, index) => (
                  <div key={`empty-${index}`} className="min-h-[90px] bg-slate-50/30" />
                ))}
                {days.map((day) => {
                  const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayEvents = filteredEvents.filter(
                    (event) => dayKey(event.startDateTime) === key,
                  );
                  return (
                    <div key={key} className="p-1.5 min-h-[90px] hover:bg-slate-50/50">
                      <span className="text-xs font-mono font-semibold text-slate-700">{day}</span>
                      <div className="space-y-1 mt-1">
                        {dayEvents.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`w-full text-left p-1 text-[10px] font-semibold rounded border truncate ${eventColors[event.eventType]}`}
                            title={event.title}
                          >
                            {event.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-6 divide-y divide-slate-100">
              {filteredEvents.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">No events in this period.</p>
              ) : (
                filteredEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full py-3 text-left flex items-start gap-3 hover:bg-slate-50"
                  >
                    <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold shrink-0">
                      {dayKey(event.startDateTime)}
                    </span>
                    <span>
                      <b className="block text-xs text-slate-900">{event.title}</b>
                      <span className="text-xs text-slate-500">
                        {timeLabel(event.startDateTime)} · {event.location || "No location"}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div className="lg:col-span-4 space-y-4">
          {selectedEvent && (
            <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${eventColors[selectedEvent.eventType]}`}
                >
                  {selectedEvent.eventType}
                </span>
                <button onClick={() => setSelectedEvent(null)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{selectedEvent.title}</h3>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(selectedEvent.startDateTime).toLocaleString()}{" "}
                  {selectedEvent.endDateTime && `– ${timeLabel(selectedEvent.endDateTime)}`}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedEvent.location || "No location"}
                </div>
              </div>
              {selectedEvent.description && (
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  {selectedEvent.description}
                </p>
              )}
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Upcoming course events
            </h3>
            {upcoming.filter((event) => courseFilter === "all" || event.courseId === courseFilter)
              .length === 0 ? (
              <p className="text-xs text-slate-400">No upcoming events.</p>
            ) : (
              upcoming
                .filter((event) => courseFilter === "all" || event.courseId === courseFilter)
                .slice(0, 6)
                .map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full p-3 rounded-lg border border-slate-100 bg-slate-50/70 text-left text-xs space-y-1 hover:bg-slate-100"
                  >
                    <span className="font-semibold text-slate-900 block">{event.title}</span>
                    <span className="text-slate-500 text-[11px] block">
                      {new Date(event.startDateTime).toLocaleString()}
                    </span>
                  </button>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

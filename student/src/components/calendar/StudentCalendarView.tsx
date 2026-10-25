import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  Check,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { CalendarEvent } from "../../types";
import { EventStatusBadge } from "../../../../shared/calendar/EventStatusBadge";

type CalendarView = "month" | "week" | "day" | "agenda";

const typeLabels: Record<string, string> = {
  ALL: "All events",
  CLASS: "Classes",
  ASSIGNMENT_DUE: "Assignments",
  QUIZ: "Quizzes",
  EXAM: "Exams",
  ATTENDANCE: "Attendance",
  OFFICE_HOURS: "Office hours",
};

const typeColors: Record<string, string> = {
  CLASS:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300",
  ASSIGNMENT_DUE:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
  QUIZ: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/60 dark:text-purple-300",
  EXAM: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300",
  ATTENDANCE:
    "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-300",
  OFFICE_HOURS:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
};

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateTime(value: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}

function startOfWeek(date: Date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - result.getDay());
  return result;
}

function eventDate(event: CalendarEvent) {
  return event.date;
}

function eventTime(event: CalendarEvent) {
  return event.startTime || "All day";
}

export const StudentCalendarView: React.FC = () => {
  const { calendarEvents, refreshCalendarEvents, courses } = useStudent();
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [activeTypes, setActiveTypes] = useState<string[]>(
    Object.keys(typeLabels).filter((type) => type !== "ALL"),
  );
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedEventCourse = selectedEvent
    ? courses.find(
        (course) =>
          course.id === selectedEvent.courseId ||
          (!!selectedEvent.courseCode && course.code === selectedEvent.courseCode),
      )
    : undefined;
  const selectedCourseName = selectedEvent?.courseTitle || selectedEventCourse?.title;
  const selectedCourseCode = selectedEvent?.courseCode || selectedEventCourse?.code;
  const selectedTeacherName = selectedEventCourse?.instructor?.name;

  const range = useMemo(() => {
    if (view === "day") {
      const start = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
      return {
        start,
        end: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59),
      };
    }
    if (view === "week") {
      const start = startOfWeek(cursor);
      return {
        start,
        end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59),
      };
    }
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    return { start, end: new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59) };
  }, [cursor, view]);

  useEffect(() => {
    let active = true;
    refreshCalendarEvents(dateTime(range.start), dateTime(range.end), {
      type:
        activeTypes.length === 1
          ? activeTypes[0] === "ASSIGNMENT_DUE"
            ? "ASSIGNMENT"
            : activeTypes[0]
          : undefined,
      courseId: courseFilter === "ALL" ? undefined : courseFilter,
    })
      .catch((reason) => {
        if (active)
          setError(reason instanceof Error ? reason.message : "Unable to load calendar events.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeTypes, courseFilter, range, refreshCalendarEvents]);

  const visibleEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return calendarEvents.filter((event) => {
      const matchesType = activeTypes.includes(event.type);
      const matchesSearch =
        !query ||
        [event.title, event.courseCode, event.courseTitle, event.location, event.description]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      return matchesType && matchesSearch;
    });
  }, [activeTypes, calendarEvents, searchQuery]);
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(
    cursor,
  );
  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const total =
      Math.ceil(
        (first.getDay() + new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()) / 7,
      ) * 7;
    return Array.from({ length: total }, (_, index) => {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), index - first.getDay() + 1);
      return { date, currentMonth: date.getMonth() === cursor.getMonth() };
    });
  }, [cursor]);
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = startOfWeek(cursor);
        date.setDate(date.getDate() + index);
        return date;
      }),
    [cursor],
  );
  const agendaEvents = [...visibleEvents].sort((a, b) =>
    `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
  );

  const moveCursor = (amount: number) => {
    const next = new Date(cursor);
    if (view === "day") next.setDate(next.getDate() + amount);
    else if (view === "week") next.setDate(next.getDate() + amount * 7);
    else next.setMonth(next.getMonth() + amount);
    setCursor(next);
  };
  const resetToday = () => setCursor(new Date());
  const title =
    view === "month"
      ? monthLabel
      : view === "week"
        ? `${weekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${weekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
        : view === "day"
          ? cursor.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "Upcoming schedule";
  const eventsFor = (key: string) => visibleEvents.filter((event) => eventDate(event) === key);
  const hasFilters =
    activeTypes.length !== Object.keys(typeLabels).length - 1 ||
    courseFilter !== "ALL" ||
    searchQuery.length > 0;
  const clearFilters = () => {
    setActiveTypes(Object.keys(typeLabels).filter((type) => type !== "ALL"));
    setCourseFilter("ALL");
    setSearchQuery("");
  };

  const filtersPanel = (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" /> Academic Filters
        </span>
        {hasFilters && (
          <button onClick={clearFilters} className="text-[10px] text-rose-600 hover:underline">
            Reset
          </button>
        )}
      </div>
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          Course Module
        </label>
        <select
          value={courseFilter}
          onChange={(event) => setCourseFilter(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="ALL">
            All Courses ({courses.filter((course) => course.enrolled).length})
          </option>
          {courses
            .filter((course) => course.enrolled)
            .map((course) => (
              <option key={course.id} value={course.id}>
                {course.code || course.title}
              </option>
            ))}
        </select>
      </div>
      <div className="space-y-1.5 border-t border-slate-100 pt-2 dark:border-slate-800">
        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          Event Categories
        </label>
        <div className="space-y-1">
          {Object.entries(typeLabels)
            .filter(([value]) => value !== "ALL")
            .map(([value, label]) => {
              const isChecked = activeTypes.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setActiveTypes((previous) =>
                      isChecked ? previous.filter((type) => type !== value) : [...previous, value],
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-[11px] transition-colors ${isChecked ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white" : "text-slate-400 opacity-50 hover:opacity-100"}`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        value === "CLASS"
                          ? "bg-indigo-500"
                          : value === "ASSIGNMENT_DUE"
                            ? "bg-amber-500"
                            : value === "QUIZ"
                              ? "bg-purple-500"
                              : value === "EXAM"
                                ? "bg-rose-500"
                                : value === "ATTENDANCE"
                                  ? "bg-cyan-500"
                                  : "bg-emerald-500"
                      }`}
                    />
                    {label}
                  </span>
                  {isChecked && <Check className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 pb-12">
      <div className="mb-2 flex flex-col gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Student</span>
            <span>/</span>
            <span>Academic Calendar</span>
          </nav>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Academic Calendar
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Your classes, assignments, quizzes, exams, and attendance schedule.
          </p>
        </div>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4 text-indigo-500" /> Filters
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => moveCursor(-1)}
            aria-label="Previous period"
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={resetToday}
            className="ml-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Today
          </button>
          <button
            onClick={() => moveCursor(1)}
            aria-label="Next period"
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h2 className="ml-2 text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          <span className="hidden rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline-block">
            Student schedule
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex min-w-[160px] items-center sm:min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search title, course..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-slate-400"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 p-1 text-xs font-medium dark:bg-slate-800/90">
            {(["month", "week", "day", "agenda"] as CalendarView[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`rounded-lg px-3 py-1 capitalize transition-all ${view === mode ? "bg-white font-semibold text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Filter className="h-3 w-3" /> Active Filters:
            </span>
            {courseFilter !== "ALL" && (
              <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                Course:{" "}
                {courses.find((course) => course.id === courseFilter)?.title || "Selected course"}
              </span>
            )}
            {activeTypes.length !== Object.keys(typeLabels).length - 1 && (
              <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300">
                Categories: {activeTypes.map((type) => typeLabels[type]).join(", ") || "None"}
              </span>
            )}
            {searchQuery && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                Search: â€œ{searchQuery}â€
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
          >
            <RotateCcw className="h-3 w-3" /> Clear Filters
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300">
          Loading calendar events...
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="hidden space-y-4 lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>{monthLabel}</span>
              <CalendarIcon className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <span key={`${day}-${index}`} className="py-0.5 font-semibold">
                  {day}
                </span>
              ))}
              {days.slice(0, 35).map(({ date, currentMonth }) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setCursor(date)}
                  className={`rounded-md py-1 font-mono ${dateKey(date) === dateKey(cursor) ? "bg-indigo-600 font-bold text-white" : currentMonth ? "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" : "text-slate-300 dark:text-slate-700"}`}
                >
                  {currentMonth ? date.getDate() : ""}
                </button>
              ))}
            </div>
          </div>
          {filtersPanel}
        </div>
        <div className="lg:col-span-3">
          {view === "month" && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="grid min-w-0 grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
                {days.map(({ date, currentMonth }) => (
                  <div
                    key={date.toISOString()}
                    className={`min-h-[112px] min-w-0 overflow-hidden p-2 ${currentMonth ? "bg-white dark:bg-slate-900" : "bg-slate-50/60 text-slate-300 dark:bg-slate-950/40 dark:text-slate-600"}`}
                  >
                    <div
                      className={`mb-1 text-xs font-semibold ${dateKey(date) === dateKey(new Date()) ? "flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {currentMonth ? date.getDate() : ""}
                    </div>
                    <div className="min-w-0 max-h-20 space-y-1 overflow-hidden">
                      {eventsFor(dateKey(date))
                        .slice(0, 3)
                        .map((event) => (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`block min-w-0 max-w-full truncate rounded border px-1.5 py-1 text-left text-[10px] font-semibold ${typeColors[event.type] || "border-slate-200 bg-slate-50 text-slate-600"} ${event.status === "CANCELLED" ? "opacity-70" : ""}`}
                          >
                            <span className={event.status === "CANCELLED" ? "line-through" : ""}>
                              {eventTime(event)} · {event.title}
                            </span>
                            {event.status === "CANCELLED" && (
                              <EventStatusBadge status={event.status} compact />
                            )}
                          </button>
                        ))}
                      {eventsFor(dateKey(date)).length > 3 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCursor(date);
                            setView("day");
                          }}
                          className="block w-full truncate px-1.5 text-left text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          +{eventsFor(dateKey(date)).length - 3} more
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "week" && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
              {weekDays.map((date) => (
                <div
                  key={date.toISOString()}
                  className="min-h-[360px] rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="border-b border-slate-100 pb-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    {date.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-3 space-y-2">
                    {eventsFor(dateKey(date)).map((event) => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full rounded-xl border p-2 text-left text-xs ${typeColors[event.type] || "border-slate-200 bg-slate-50 text-slate-600"} ${event.status === "CANCELLED" ? "opacity-70" : ""}`}
                      >
                        <b
                          className={`block truncate ${event.status === "CANCELLED" ? "line-through" : ""}`}
                        >
                          {event.title}
                        </b>
                        {event.status === "CANCELLED" && (
                          <EventStatusBadge status={event.status} compact />
                        )}
                        <span className="mt-1 block text-[10px]">
                          {eventTime(event)} Â· {event.location || "No location"}
                        </span>
                      </button>
                    ))}
                    {!eventsFor(dateKey(date)).length && (
                      <p className="text-[11px] text-slate-400">No events</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "day" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-3">
                {eventsFor(dateKey(cursor)).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left ${typeColors[event.type] || "border-slate-200 bg-slate-50 text-slate-600"} ${event.status === "CANCELLED" ? "opacity-70" : ""}`}
                  >
                    <span className="w-20 shrink-0 text-xs font-bold">{eventTime(event)}</span>
                    <span>
                      <b
                        className={`block text-sm ${event.status === "CANCELLED" ? "line-through" : ""}`}
                      >
                        {event.title}
                      </b>
                      {event.status === "CANCELLED" && (
                        <EventStatusBadge status={event.status} compact />
                      )}
                      <span className="mt-1 block text-xs">
                        {event.courseCode || "General"} Â· {event.location || "No location"}
                      </span>
                    </span>
                  </button>
                ))}
                {!eventsFor(dateKey(cursor)).length && (
                  <div className="py-16 text-center text-xs text-slate-400">
                    No events scheduled for this day.
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "agenda" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-3">
                {agendaEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700 ${event.status === "CANCELLED" ? "opacity-70" : ""}`}
                  >
                    <span className="w-24 shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {new Date(`${event.date}T00:00:00`).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="min-w-0 flex-1">
                      <b
                        className={`block truncate text-sm text-slate-900 dark:text-white ${event.status === "CANCELLED" ? "line-through" : ""}`}
                      >
                        {event.title}
                      </b>
                      <span className="text-xs text-slate-500">
                        {event.courseCode || "General"} Â· {eventTime(event)}
                      </span>
                    </span>
                    <span
                      className={`hidden rounded-full border px-2 py-1 text-[10px] font-semibold sm:inline ${typeColors[event.type] || ""}`}
                    >
                      {typeLabels[event.type] || event.type}
                    </span>
                    {event.status === "CANCELLED" && (
                      <EventStatusBadge status={event.status} compact />
                    )}
                  </button>
                ))}
                {!agendaEvents.length && (
                  <div className="py-16 text-center text-xs text-slate-400">
                    No upcoming events in this range.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/40" />
          <div
            className="absolute right-0 top-0 h-full w-[min(340px,90vw)] overflow-y-auto bg-slate-50 p-4 shadow-2xl dark:bg-slate-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white">Calendar Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filtersPanel}
          </div>
        </div>
      )}

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${typeColors[selectedEvent.type] || ""}`}
                >
                  {typeLabels[selectedEvent.type] || selectedEvent.type}
                </span>
                {selectedEvent.status === "CANCELLED" && (
                  <span className="ml-2 inline-flex align-middle">
                    <EventStatusBadge status={selectedEvent.status} />
                  </span>
                )}
                <h3
                  className={`mt-3 font-display text-lg font-bold text-slate-900 dark:text-white ${selectedEvent.status === "CANCELLED" ? "line-through text-slate-400" : ""}`}
                >
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                aria-label="Close event details"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 pt-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-slate-400" />
                {new Date(`${selectedEvent.date}T00:00:00`).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                {selectedEvent.startTime || "All day"}
                {selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ""}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                {selectedEvent.location || "No location provided"}
              </div>
              {(selectedCourseName || selectedCourseCode) && (
                <div className="space-y-1 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <p>
                    Course:{" "}
                    <span className="font-semibold">
                      {selectedCourseName || selectedCourseCode}
                    </span>
                  </p>
                  {selectedCourseCode && selectedCourseName && (
                    <p>
                      Course code: <span className="font-semibold">{selectedCourseCode}</span>
                    </p>
                  )}
                  <p>
                    Assigned teacher:{" "}
                    <span className="font-semibold">{selectedTeacherName || "Not provided"}</span>
                  </p>
                </div>
              )}
              <p className="border-t border-slate-100 pt-3 leading-relaxed dark:border-slate-800">
                {selectedEvent.description || "No additional details were provided."}
              </p>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

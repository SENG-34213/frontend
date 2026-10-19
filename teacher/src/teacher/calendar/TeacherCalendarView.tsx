"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AdminCalendar } from "../../../../admin/src/admin/calendar/AdminCalendar";
import type { AcademicEvent, Course as AdminCourse } from "../../../../admin/src/admin/types";
import type {
  CalendarEventFilters as AdminCalendarEventFilters,
  CalendarEventRequest as AdminCalendarEventRequest,
} from "../../../../admin/src/admin/api/calendarApi";
import type { BackendCourse } from "../api/courseApi";
import {
  cancelCalendarEvent,
  createCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
  type BackendCalendarEvent,
  type CalendarEventRequest,
} from "../api/calendarApi";

type TeacherCalendarViewProps = { backendCourses: BackendCourse[] };

function mapEvent(event: BackendCalendarEvent, courses: AdminCourse[]): AcademicEvent {
  const start = new Date(event.startDateTime);
  const end = event.endDateTime ? new Date(event.endDateTime) : null;
  const course = courses.find((item) => item.id === event.courseId);
  const type: AcademicEvent["type"] =
    event.eventType === "ASSIGNMENT"
      ? "DEADLINE"
      : event.eventType === "MEETING" ||
          event.eventType === "HOLIDAY" ||
          event.eventType === "ADMIN" ||
          event.eventType === "CUSTOM"
        ? "SESSION"
        : event.eventType === "ATTENDANCE"
          ? "CLASS"
          : event.eventType === "CLASS" || event.eventType === "EXAM" || event.eventType === "QUIZ"
            ? event.eventType
            : "SESSION";

  return {
    id: event.id,
    title: event.title,
    type,
    date: event.startDateTime.slice(0, 10),
    time: event.allDay
      ? "All day"
      : `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${end ? ` - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`,
    location: event.location || "Not specified",
    courseCode: course?.code,
    courseTitle: course?.title,
    status: event.status,
    description: event.description || "",
    eventType: event.eventType,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime || null,
    allDay: event.allDay,
    courseId: event.courseId || null,
    visibility: event.visibility,
    targetRole: event.targetRole,
    canEdit: event.canEdit,
    canCancel: event.canCancel,
  };
}

function mapCourse(course: BackendCourse): AdminCourse {
  return {
    id: course.id,
    code: course.code || course.id,
    title: course.courseName,
    teacherId: course.assignedTeacherId || "",
    teacherName: "Faculty Member",
    grade: "",
    enrollmentCount: course.numberOfStudents || 0,
    maxCapacity: 0,
    status: course.courseStatus || "PUBLISHED",
    description: course.courseDescription || "",
    modulesCount: 0,
    category: course.subject || "Academic",
    startDate: "",
    endDate: "",
  };
}

function toTeacherRequest(request: AdminCalendarEventRequest): CalendarEventRequest {
  return {
    title: request.title,
    description: request.description,
    eventType: request.eventType,
    startDateTime: request.startDateTime,
    endDateTime: request.endDateTime,
    allDay: request.allDay,
    courseId: request.courseId,
    visibility: request.visibility,
    targetRole: request.targetRole === "SUPER_ADMIN" ? "ADMIN" : request.targetRole,
    location: request.location,
  };
}

export const TeacherCalendarView: React.FC<TeacherCalendarViewProps> = ({ backendCourses }) => {
  const courses = useMemo(() => backendCourses.map(mapCourse), [backendCourses]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);

  const loadEvents = useCallback(
    async (start: Date, end: Date, filters: AdminCalendarEventFilters = {}) => {
      const backendEvents = await getCalendarEvents(start, end, filters.courseId);
      const filteredEvents = backendEvents.filter(
        (event) =>
          (!filters.type || event.eventType === filters.type) &&
          (!filters.status || event.status === filters.status),
      );
      setEvents(filteredEvents.map((event) => mapEvent(event, courses)));
    },
    [courses],
  );

  useEffect(() => {
    const start = new Date(2026, 9, 1);
    const end = new Date(2026, 10, 1);
    void loadEvents(start, end).catch(() => setEvents([]));
  }, [loadEvents]);

  const handleAddEvent = useCallback(
    async (request: AdminCalendarEventRequest) => {
      const created = await createCalendarEvent(toTeacherRequest(request));
      setEvents((current) => [...current, mapEvent(created, courses)]);
    },
    [courses],
  );

  const handleUpdateEvent = useCallback(
    async (eventId: string, request: AdminCalendarEventRequest) => {
      const updated = await updateCalendarEvent(eventId, toTeacherRequest(request));
      setEvents((current) =>
        current.map((event) => (event.id === eventId ? mapEvent(updated, courses) : event)),
      );
    },
    [courses],
  );

  const handleCancelEvent = useCallback(
    async (eventId: string) => {
      const cancelled = await cancelCalendarEvent(eventId);
      setEvents((current) =>
        current.map((event) => (event.id === eventId ? mapEvent(cancelled, courses) : event)),
      );
    },
    [courses],
  );

  const handleFilterEvents = useCallback(
    async (filters: AdminCalendarEventFilters, start: Date, end: Date) => {
      await loadEvents(start, end, filters);
    },
    [loadEvents],
  );

  return (
    <AdminCalendar
      events={events}
      courses={courses}
      onAddEvent={handleAddEvent}
      onUpdateEvent={handleUpdateEvent}
      onCancelEvent={handleCancelEvent}
      onFilterEvents={handleFilterEvents}
    />
  );
};

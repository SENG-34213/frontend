"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TeacherCalendar } from "./TeacherCalendar";
import type { AcademicEvent, Course as AdminCourse } from "../../../../admin/src/admin/types";
import type {
  CalendarEventFilters as AdminCalendarEventFilters,
  CalendarEventRequest as AdminCalendarEventRequest,
} from "../../../../admin/src/admin/api/calendarApi";
import type { BackendCourse } from "../api/courseApi";
import type { TeacherProfile } from "../types";
import type { CalendarInstructor } from "./TeacherCalendar";
import {
  cancelCalendarEvent,
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
  type BackendCalendarEvent,
  type CalendarEventRequest,
} from "../api/calendarApi";

type TeacherCalendarViewProps = {
  backendCourses: BackendCourse[];
  teacher?: Pick<TeacherProfile, "name" | "email" | "department">;
};

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
    canDelete: event.canDelete,
  };
}

function mapCourse(course: BackendCourse): AdminCourse {
  return {
    id: course.id,
    code: course.courseCode || "",
    title:
      course.courseName?.trim() ||
      course.title?.trim() ||
      course.subject?.trim() ||
      course.courseCode?.trim() ||
      "Untitled course",
    teacherId: course.assignedTeacherId || "",
    teacherName: "",
    grade: course.gradeName || "",
    enrollmentCount: course.numberOfStudents ?? 0,
    maxCapacity: course.maxCapacity ?? 0,
    status: course.courseStatus || "PUBLISHED",
    description: course.courseDescription ?? "",
    modulesCount: Number(course.moduleCount ?? 0),
    category: course.subject ?? "",
    startDate: course.publishedDate || "",
    endDate: "",
  };
}

function toTeacherRequest(request: AdminCalendarEventRequest): CalendarEventRequest {
  if (!request.courseId) {
    throw new Error("Select one of your assigned courses before saving this event.");
  }

  return {
    title: request.title,
    description: request.description,
    eventType: request.eventType,
    startDateTime: request.startDateTime,
    endDateTime: request.endDateTime,
    allDay: request.allDay,
    courseId: request.courseId,
    visibility: "COURSE",
    targetRole: null,
    location: request.location,
  };
}

export const TeacherCalendarView: React.FC<TeacherCalendarViewProps> = ({
  backendCourses,
  teacher,
}) => {
  const courses = useMemo(() => backendCourses.map(mapCourse), [backendCourses]);
  const instructors = useMemo<CalendarInstructor[]>(
    () =>
      teacher?.name ? [{ name: teacher.name, email: teacher.email, dept: teacher.department }] : [],
    [teacher],
  );
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
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
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

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    await deleteCalendarEvent(eventId);
    setEvents((current) => current.filter((event) => event.id !== eventId));
  }, []);

  const handleFilterEvents = useCallback(
    async (filters: AdminCalendarEventFilters, start: Date, end: Date) => {
      await loadEvents(start, end, filters);
    },
    [loadEvents],
  );

  return (
    <TeacherCalendar
      events={events}
      courses={courses}
      instructors={instructors}
      onAddEvent={handleAddEvent}
      onUpdateEvent={handleUpdateEvent}
      onCancelEvent={handleCancelEvent}
      onDeleteEvent={handleDeleteEvent}
      onFilterEvents={handleFilterEvents}
    />
  );
};

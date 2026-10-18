import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";
import type { AcademicEvent } from "../types";

export type CalendarEventType =
  | "CLASS"
  | "ASSIGNMENT"
  | "QUIZ"
  | "EXAM"
  | "MEETING"
  | "HOLIDAY"
  | "ADMIN"
  | "CUSTOM"
  | "ATTENDANCE";
export type CalendarVisibility = "PRIVATE" | "COURSE" | "ROLE" | "GLOBAL";
export type CalendarTargetRole = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";
export type CalendarEventStatus = "SCHEDULED" | "CANCELLED";

export interface CalendarEventFilters {
  type?: CalendarEventType;
  courseId?: string;
  status?: CalendarEventStatus;
}

export interface CalendarEventRequest {
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startDateTime: string;
  endDateTime?: string | null;
  allDay: boolean;
  courseId?: string | null;
  visibility: CalendarVisibility;
  targetRole?: CalendarTargetRole | null;
  location?: string;
}

interface CalendarEventResponse extends CalendarEventRequest {
  id: string;
  sourceType?: string;
  sourceId?: string | null;
  createdBy?: string;
  status: "SCHEDULED" | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
  canEdit?: boolean;
  canCancel?: boolean;
}

function uiEventType(type: CalendarEventType): AcademicEvent["type"] {
  if (type === "ASSIGNMENT") return "DEADLINE";
  if (type === "MEETING" || type === "HOLIDAY" || type === "ADMIN" || type === "CUSTOM") {
    return "SESSION";
  }
  if (type === "ATTENDANCE") return "CLASS";
  return type === "CLASS" || type === "EXAM" || type === "QUIZ" ? type : "SESSION";
}

function timeLabel(event: CalendarEventResponse) {
  if (event.allDay) return "All day";
  const start = new Date(event.startDateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!event.endDateTime) return start;
  const end = new Date(event.endDateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${start} - ${end}`;
}

export function mapCalendarEvent(event: CalendarEventResponse): AcademicEvent {
  return {
    id: event.id,
    title: event.title,
    type: uiEventType(event.eventType),
    date: event.startDateTime.slice(0, 10),
    time: timeLabel(event),
    location: event.location || "Not specified",
    status: event.status,
    description: event.description || "",
    eventType: event.eventType,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    allDay: event.allDay,
    courseId: event.courseId,
    visibility: event.visibility,
    targetRole: event.targetRole,
    canEdit: event.canEdit,
    canCancel: event.canCancel,
  };
}

function apiDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

function localDateTime(value: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}

export async function fetchCalendarEvents(
  start: Date,
  end: Date,
  filters: CalendarEventFilters = {},
): Promise<AcademicEvent[]> {
  const params = new URLSearchParams({
    start: localDateTime(start),
    end: localDateTime(end),
  });
  if (filters.type) params.set("type", filters.type);
  if (filters.courseId) params.set("courseId", filters.courseId);
  if (filters.status) params.set("status", filters.status);
  const response = await apiRequest<ApiResponse<CalendarEventResponse[]>>(
    `/api/v1/calendar/events?${params.toString()}`,
  );
  return (response.data || []).map(mapCalendarEvent);
}

export async function fetchUpcomingCalendarEvents(limit = 10): Promise<AcademicEvent[]> {
  const response = await apiRequest<ApiResponse<CalendarEventResponse[]>>(
    `/api/v1/calendar/upcoming?limit=${limit}`,
  );
  return (response.data || []).map(mapCalendarEvent);
}

export async function createCalendarEvent(request: CalendarEventRequest): Promise<AcademicEvent> {
  const response = await apiRequest<ApiResponse<CalendarEventResponse>>("/api/v1/calendar/events", {
    method: "POST",
    body: {
      ...request,
      startDateTime: apiDateTime(request.startDateTime),
      endDateTime: request.endDateTime ? apiDateTime(request.endDateTime) : null,
    },
  });
  if (!response.data) throw new Error(response.message || "Calendar service returned no event.");
  return mapCalendarEvent(response.data);
}

export async function updateCalendarEvent(
  eventId: string,
  request: CalendarEventRequest,
): Promise<AcademicEvent> {
  const response = await apiRequest<ApiResponse<CalendarEventResponse>>(
    `/api/v1/calendar/events/${eventId}`,
    {
      method: "PUT",
      body: {
        ...request,
        startDateTime: apiDateTime(request.startDateTime),
        endDateTime: request.endDateTime ? apiDateTime(request.endDateTime) : null,
      },
    },
  );
  if (!response.data) throw new Error(response.message || "Calendar service returned no event.");
  return mapCalendarEvent(response.data);
}

export async function cancelCalendarEvent(eventId: string): Promise<AcademicEvent> {
  const response = await apiRequest<ApiResponse<CalendarEventResponse>>(
    `/api/v1/calendar/events/${eventId}/cancel`,
    { method: "POST" },
  );
  if (!response.data) throw new Error(response.message || "Calendar service returned no event.");
  return mapCalendarEvent(response.data);
}

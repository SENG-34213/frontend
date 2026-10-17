import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

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
export type CalendarEventStatus = "SCHEDULED" | "CANCELLED";

export type BackendCalendarEvent = {
  id: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startDateTime: string;
  endDateTime?: string;
  allDay: boolean;
  courseId?: string;
  sourceType?: string;
  sourceId?: string;
  createdBy?: string;
  visibility?: "PRIVATE" | "COURSE" | "ROLE" | "GLOBAL";
  targetRole?: "ADMIN" | "TEACHER" | "STUDENT";
  status: CalendarEventStatus;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  canEdit: boolean;
  canCancel: boolean;
};

function isoDateTime(value: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}

export async function getCalendarEvents(
  start: Date,
  end: Date,
  courseId?: string,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ start: isoDateTime(start), end: isoDateTime(end) });
  if (courseId) params.set("courseId", courseId);
  const response = await apiRequest<ApiResponse<BackendCalendarEvent[]>>(
    `/api/v1/calendar/events?${params.toString()}`,
    { signal },
  );
  return response.data ?? [];
}

export async function getUpcomingCalendarEvents(limit = 20, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendCalendarEvent[]>>(
    `/api/v1/calendar/upcoming?limit=${encodeURIComponent(limit)}`,
    { signal },
  );
  return response.data ?? [];
}

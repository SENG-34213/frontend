import { apiRequest } from "./client";

export interface AdminQuizRecord {
  id: string;
  courseId: string;
  teacherId?: string;
  title: string;
  durationMinutes?: number;
  totalMarks?: number;
  passMark?: number;
  startTime?: string;
  endTime?: string;
  status?: "DRAFT" | "PUBLISHED" | "CLOSED" | string;
  questions?: unknown[];
  questionCount?: number;
}

type ApiEnvelope<T> = { data?: T };

function unwrap<T>(response: T | ApiEnvelope<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiEnvelope<T>).data as T;
  }
  return response as T;
}

export async function fetchCourseQuizzes(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<AdminQuizRecord[] | ApiEnvelope<AdminQuizRecord[]>>(
    `/api/courses/${encodeURIComponent(courseId)}/quizzes`,
    { signal },
  );
  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
}

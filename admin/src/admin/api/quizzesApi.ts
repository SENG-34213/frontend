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

export interface QuizResultRecord {
  studentId: string;
  studentName: string;
  marksObtained?: number;
  percentage?: number;
  passed: boolean;
  submittedAt?: string;
}

export interface QuizResultsResponse {
  quizId: string;
  totalMarks?: number;
  results?: QuizResultRecord[];
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
    `/api/quizzes/admin/courses/${encodeURIComponent(courseId)}`,
    { signal },
  );
  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
}

export async function fetchQuizResults(quizId: string, signal?: AbortSignal) {
  const response = await apiRequest<QuizResultsResponse | ApiEnvelope<QuizResultsResponse>>(
    `/api/quizzes/${encodeURIComponent(quizId)}/results`,
    { signal },
  );
  const data = unwrap(response);
  return data ?? { quizId, results: [] };
}

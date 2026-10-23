import { apiRequest } from "./client";

export interface AdminContentModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  sequenceOrder: number;
  startDate?: string;
  endDate?: string;
  visible?: boolean;
}

export interface AdminContentLesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  contentType?: string;
  visible?: boolean;
  teachingCompleted?: boolean;
  materials?: Array<{ id: string; title: string; type?: string }>;
}

type ApiEnvelope<T> = { data?: T };

function unwrap<T>(response: T | ApiEnvelope<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiEnvelope<T>).data as T;
  }
  return response as T;
}

function listData<T>(response: T[] | ApiEnvelope<T[]>): T[] {
  const value = unwrap(response);
  return Array.isArray(value) ? value : [];
}

export function fetchCourseModules(courseId: string, signal?: AbortSignal) {
  return apiRequest<AdminContentModule[] | ApiEnvelope<AdminContentModule[]>>(
    `/api/v1/course/${encodeURIComponent(courseId)}/modules`,
    { signal },
  ).then(listData);
}

export function fetchModuleLessons(courseId: string, moduleId: string, signal?: AbortSignal) {
  return apiRequest<AdminContentLesson[] | ApiEnvelope<AdminContentLesson[]>>(
    `/api/v1/course/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons`,
    { signal },
  ).then(listData);
}

export function fetchLessonMaterials(
  courseId: string,
  moduleId: string,
  lessonId: string,
  signal?: AbortSignal,
) {
  return apiRequest<AdminContentLesson["materials"] | ApiEnvelope<AdminContentLesson["materials"]>>(
    `/api/v1/course/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons/${encodeURIComponent(lessonId)}/materials`,
    { signal },
  ).then((response) => unwrap(response) || []);
}

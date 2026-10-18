import { apiRequest } from "./client";

export type CourseContentModule = {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  sequenceOrder: number;
  dateDuration?: number;
  visible?: boolean;
  moduleImage?: string;
};

export type CourseContentLesson = {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  visible?: boolean;
  releaseDate?: string;
};

export type CourseContentMaterial = {
  id: string;
  moduleId: string;
  lessonId?: string;
  title: string;
  type?: "PDF" | "VIDEO" | "IMAGE" | "AUDIO" | "DOC" | "PPT";
  fileUrl?: string;
  materialId?: string;
};

type ApiEnvelope<T> = { data?: T };

function unwrap<T>(response: T | ApiEnvelope<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiEnvelope<T>).data as T;
  }
  return response as T;
}

export function getCourseModules(courseId: string, signal?: AbortSignal) {
  return apiRequest<CourseContentModule[] | ApiEnvelope<CourseContentModule[]>>(
    `/api/v1/course/${courseId}/modules`,
    { signal },
  ).then(unwrap);
}

export function createCourseModule(
  courseId: string,
  payload: { title: string; description?: string; sequenceOrder: number; isVisible?: boolean },
) {
  return apiRequest<CourseContentModule | ApiEnvelope<CourseContentModule>>(
    `/api/v1/course/${courseId}/modules`,
    { method: "POST", body: payload },
  ).then(unwrap);
}

export function updateCourseModule(
  courseId: string,
  moduleId: string,
  payload: { title: string; description?: string; sequenceOrder: number; isVisible?: boolean },
) {
  return apiRequest<CourseContentModule | ApiEnvelope<CourseContentModule>>(
    `/api/v1/course/${courseId}/modules/${moduleId}`,
    { method: "PUT", body: payload },
  ).then(unwrap);
}

export function deleteCourseModule(courseId: string, moduleId: string) {
  return apiRequest<void>(`/api/v1/course/${courseId}/modules/${moduleId}`, { method: "DELETE" });
}

export function getModuleLessons(courseId: string, moduleId: string, signal?: AbortSignal) {
  return apiRequest<CourseContentLesson[] | ApiEnvelope<CourseContentLesson[]>>(
    `/api/v1/course/${courseId}/modules/${moduleId}/lessons`,
    { signal },
  ).then(unwrap);
}

export function createModuleLesson(
  courseId: string,
  moduleId: string,
  payload: { title: string; description?: string; isVisible?: boolean; releaseDate?: string },
) {
  return apiRequest<CourseContentLesson | ApiEnvelope<CourseContentLesson>>(
    `/api/v1/course/${courseId}/modules/${moduleId}/lessons`,
    { method: "POST", body: payload },
  ).then(unwrap);
}

export function updateModuleLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  payload: { title: string; description?: string; isVisible?: boolean; releaseDate?: string },
) {
  return apiRequest<CourseContentLesson | ApiEnvelope<CourseContentLesson>>(
    `/api/v1/course/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
    { method: "PUT", body: payload },
  ).then(unwrap);
}

export function deleteModuleLesson(courseId: string, moduleId: string, lessonId: string) {
  return apiRequest<void>(`/api/v1/course/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
    method: "DELETE",
  });
}

export function getModuleMaterials(courseId: string, moduleId: string, signal?: AbortSignal) {
  return apiRequest<CourseContentMaterial[] | ApiEnvelope<CourseContentMaterial[]>>(
    `/api/v1/course/${courseId}/modules/${moduleId}/learning-materials`,
    { signal },
  ).then(unwrap);
}

export function createModuleMaterial(
  courseId: string,
  moduleId: string,
  payload: {
    title: string;
    type?: CourseContentMaterial["type"];
    fileUrl?: string;
    materialId?: string;
    lessonId?: string;
  },
) {
  return apiRequest<CourseContentMaterial | ApiEnvelope<CourseContentMaterial>>(
    `/api/v1/course/${courseId}/modules/${moduleId}/learning-materials`,
    { method: "POST", body: payload },
  ).then(unwrap);
}

export function updateModuleMaterial(
  courseId: string,
  moduleId: string,
  materialId: string,
  payload: {
    title: string;
    type?: CourseContentMaterial["type"];
    fileUrl?: string;
    materialId?: string;
    lessonId?: string;
  },
) {
  return apiRequest<CourseContentMaterial | ApiEnvelope<CourseContentMaterial>>(
    `/api/v1/course/${courseId}/modules/${moduleId}/learning-materials/${materialId}`,
    { method: "PUT", body: payload },
  ).then(unwrap);
}

export function deleteModuleMaterial(courseId: string, moduleId: string, materialId: string) {
  return apiRequest<void>(
    `/api/v1/course/${courseId}/modules/${moduleId}/learning-materials/${materialId}`,
    { method: "DELETE" },
  );
}

import { apiRequest } from "./client";

export type CourseContentModule = {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  sequenceOrder: number;
  startDate?: string;
  endDate?: string;
  visible?: boolean;
  moduleImage?: string;
};

export type CourseContentLesson = {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  durationMinutes: number;
  contentType?: string;
  contentMarkdown?: string;
  materials?: CourseContentMaterial[];
  visible?: boolean;
  releaseDate?: string;
};

export type CourseContentMaterial = {
  id: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  type?: string;
  fileUrl?: string;
  originalFilename?: string;
  contentType?: string;
  fileSize?: number;
  status?: string;
  materialId?: string;
};

type ApiEnvelope<T> = { data?: T };

function unwrap<T>(response: T | ApiEnvelope<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiEnvelope<T>).data as T;
  }
  return response as T;
}

function coursePath(courseId: string) {
  return encodeURIComponent(courseId);
}

function modulePath(courseId: string, moduleId: string) {
  return `/api/v1/course/${coursePath(courseId)}/modules/${encodeURIComponent(moduleId)}`;
}

function listData<T>(response: T[] | ApiEnvelope<T[]>): T[] {
  const value = unwrap(response);
  return Array.isArray(value) ? value : [];
}

export function getCourseModules(courseId: string, signal?: AbortSignal) {
  return apiRequest<CourseContentModule[] | ApiEnvelope<CourseContentModule[]>>(
    `/api/v1/course/${coursePath(courseId)}/modules`,
    { signal },
  ).then(listData);
}

export function createCourseModule(
  courseId: string,
  payload: {
    title: string;
    description?: string;
    moduleImage?: string;
    sequenceOrder: number;
    startDate: string;
    endDate: string;
    isVisible?: boolean;
  },
) {
  return apiRequest<CourseContentModule | ApiEnvelope<CourseContentModule>>(
    `/api/v1/course/${coursePath(courseId)}/modules`,
    { method: "POST", body: payload },
  ).then(unwrap);
}

export function updateCourseModule(
  courseId: string,
  moduleId: string,
  payload: {
    title: string;
    description?: string;
    moduleImage?: string;
    sequenceOrder: number;
    startDate: string;
    endDate: string;
    isVisible?: boolean;
  },
) {
  return apiRequest<CourseContentModule | ApiEnvelope<CourseContentModule>>(
    modulePath(courseId, moduleId),
    { method: "PUT", body: payload },
  ).then(unwrap);
}

export function deleteCourseModule(courseId: string, moduleId: string) {
  return apiRequest<void>(modulePath(courseId, moduleId), { method: "DELETE" });
}

export function getModuleLessons(courseId: string, moduleId: string, signal?: AbortSignal) {
  return apiRequest<CourseContentLesson[] | ApiEnvelope<CourseContentLesson[]>>(
    `${modulePath(courseId, moduleId)}/lessons`,
    { signal },
  ).then(listData);
}

export function createModuleLesson(
  courseId: string,
  moduleId: string,
  payload: {
    title: string;
    description?: string;
    durationMinutes: number;
    contentType?: string;
    contentMarkdown?: string;
    isVisible?: boolean;
    releaseDate?: string;
  },
) {
  return apiRequest<CourseContentLesson | ApiEnvelope<CourseContentLesson>>(
    `${modulePath(courseId, moduleId)}/lessons`,
    { method: "POST", body: payload },
  ).then(unwrap);
}

export function updateModuleLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  payload: {
    title: string;
    description?: string;
    durationMinutes: number;
    contentType?: string;
    contentMarkdown?: string;
    isVisible?: boolean;
    releaseDate?: string;
  },
) {
  return apiRequest<CourseContentLesson | ApiEnvelope<CourseContentLesson>>(
    `${modulePath(courseId, moduleId)}/lessons/${encodeURIComponent(lessonId)}`,
    { method: "PUT", body: payload },
  ).then(unwrap);
}

export function deleteModuleLesson(courseId: string, moduleId: string, lessonId: string) {
  return apiRequest<void>(
    `${modulePath(courseId, moduleId)}/lessons/${encodeURIComponent(lessonId)}`,
    {
      method: "DELETE",
    },
  );
}

export function getModuleMaterials(courseId: string, moduleId: string, signal?: AbortSignal) {
  return apiRequest<CourseContentMaterial[] | ApiEnvelope<CourseContentMaterial[]>>(
    `${modulePath(courseId, moduleId)}/learning-materials`,
    { signal },
  ).then(listData);
}

export function getLessonMaterials(
  courseId: string,
  moduleId: string,
  lessonId: string,
  signal?: AbortSignal,
) {
  return apiRequest<CourseContentMaterial[] | ApiEnvelope<CourseContentMaterial[]>>(
    `${modulePath(courseId, moduleId)}/lessons/${encodeURIComponent(lessonId)}/materials`,
    { signal },
  ).then(listData);
}

export function uploadLessonMaterial(
  courseId: string,
  moduleId: string,
  lessonId: string,
  values: { title: string; description?: string; file: File },
) {
  const body = new FormData();
  body.set("title", values.title);
  if (values.description) body.set("description", values.description);
  body.set("file", values.file);

  return apiRequest<CourseContentMaterial | ApiEnvelope<CourseContentMaterial>>(
    `${modulePath(courseId, moduleId)}/lessons/${encodeURIComponent(lessonId)}/materials/upload`,
    { method: "POST", body },
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
    `${modulePath(courseId, moduleId)}/learning-materials`,
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
    `${modulePath(courseId, moduleId)}/learning-materials/${encodeURIComponent(materialId)}`,
    { method: "PUT", body: payload },
  ).then(unwrap);
}

export function deleteModuleMaterial(courseId: string, moduleId: string, materialId: string) {
  return apiRequest<void>(
    `${modulePath(courseId, moduleId)}/learning-materials/${encodeURIComponent(materialId)}`,
    { method: "DELETE" },
  );
}

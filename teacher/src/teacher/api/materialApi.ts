import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type MaterialType =
  | "PDF"
  | "DOCUMENT"
  | "PRESENTATION"
  | "SPREADSHEET"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "ARCHIVE"
  | "OTHER";
export type MaterialPurpose =
  | "LEARNING_MATERIAL"
  | "ASSIGNMENT_ATTACHMENT"
  | "SUBMISSION_ATTACHMENT"
  | "AI_SOURCE"
  | "ANNOUNCEMENT_ATTACHMENT"
  | "OTHER";
export type MaterialStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "AVAILABLE"
  | "ARCHIVED"
  | "DELETED"
  | "FAILED";

export type Material = {
  id: string;
  title: string;
  description: string | null;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  type: MaterialType;
  purpose: MaterialPurpose;
  status: MaterialStatus;
  uploadedBy: string;
  courseId: string | null;
  checksum: string | null;
  createdAt: string;
  updatedAt: string;
  storageKey?: string;
};

export type MaterialDownload = Material & { downloadUrl: string; expiresAt: string };
export type MaterialPage = {
  content: Material[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};
export type MaterialFilters = {
  search?: string;
  type?: MaterialType;
  purpose?: MaterialPurpose;
  status?: MaterialStatus;
  courseId?: string;
  page?: number;
  size?: number;
  sort?: string;
};

function queryString(filters: MaterialFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params.toString();
}

function unwrap<T>(response: ApiResponse<T>) {
  if (!response.data) throw new Error(response.message || "The server returned no material data.");
  return response.data;
}

export async function getMaterials(filters: MaterialFilters = {}, signal?: AbortSignal) {
  const query = queryString(filters);
  const response = await apiRequest<ApiResponse<MaterialPage>>(
    `/api/v1/materials${query ? `?${query}` : ""}`,
    { signal },
  );
  return unwrap(response);
}

export async function getMaterial(id: string, signal?: AbortSignal) {
  return unwrap(await apiRequest<ApiResponse<Material>>(`/api/v1/materials/${id}`, { signal }));
}

export async function getMaterialDownload(id: string) {
  return unwrap(
    await apiRequest<ApiResponse<MaterialDownload>>(`/api/v1/materials/${id}/download`),
  );
}

export async function uploadMaterial(
  values: {
    title: string;
    description?: string;
    purpose: MaterialPurpose;
    courseId: string;
    file: File;
  },
  onProgress?: (progress: number) => void,
) {
  const body = new FormData();
  body.set("title", values.title);
  body.set("purpose", values.purpose);
  body.set("courseId", values.courseId);
  if (values.description) body.set("description", values.description);
  body.set("file", values.file);
  onProgress?.(15);
  const result = unwrap(
    await apiRequest<ApiResponse<Material>>("/api/v1/materials", {
      method: "POST",
      body,
    }),
  );
  onProgress?.(100);
  return result;
}

export async function updateMaterial(
  id: string,
  values: { title: string; description: string | null },
) {
  return unwrap(
    await apiRequest<ApiResponse<Material>>(`/api/v1/materials/${id}`, {
      method: "PUT",
      body: values,
    }),
  );
}

export async function archiveMaterial(id: string) {
  return unwrap(
    await apiRequest<ApiResponse<Material>>(`/api/v1/materials/${id}/archive`, { method: "POST" }),
  );
}

export async function deleteMaterial(id: string) {
  return unwrap(
    await apiRequest<ApiResponse<Material>>(`/api/v1/materials/${id}`, { method: "DELETE" }),
  );
}

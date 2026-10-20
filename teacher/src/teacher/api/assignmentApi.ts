import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type BackendAssignmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export type BackendAssignment = {
  id: string;
  courseId: string;
  moduleId: string;
  lessonId?: string;
  teacherId?: string;
  title: string;
  description?: string;
  instructions?: string;
  startDate: string;
  dueDate: string;
  maxMarks: number;
  allowedAttempts: number;
  allowLateSubmission: boolean;
  latePenaltyPercentage?: number;
  status: BackendAssignmentStatus;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  rubricItems?: { id?: string; criterion: string; marks: number; displayOrder?: number }[];
  totalSubmissions?: number;
  gradedCount?: number;
};

export type AssignmentAttachment = {
  id: string;
  assignmentId: string;
  materialId?: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  materialBacked: boolean;
  createdAt?: string;
};

export type AssignmentAttachmentDownload = AssignmentAttachment & {
  downloadUrl?: string;
  expiresAt?: string;
  content?: string;
};

export type AssignmentDraft = {
  courseId: string;
  moduleId: string;
  lessonId?: string;
  title: string;
  description?: string;
  instructions?: string;
  startDate: string;
  dueDate: string;
  maxMarks: number;
  allowedAttempts: number;
  allowLateSubmission: boolean;
  latePenaltyPercentage?: number;
  rubricItems?: { criterion: string; marks: number }[];
};

export type AssignmentUpdateDraft = Omit<AssignmentDraft, "courseId" | "moduleId" | "lessonId">;

export type BackendSubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "LATE"
  | "GRADED"
  | "RETURNED";

export type BackendSubmission = {
  id: string;
  assignmentId: string;
  studentId: string;
  attemptNumber: number;
  status: BackendSubmissionStatus;
  content?: string;
  isLate?: boolean;
  submittedAt?: string;
  marks?: number;
  feedback?: string;
  gradedAt?: string;
  returnedAt?: string;
};

function unwrap<T>(response: ApiResponse<T>) {
  return response.data as T;
}

export async function getCourseAssignments(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendAssignment[]>>(
    `/api/v1/courses/${encodeURIComponent(courseId)}/assignments`,
    { signal },
  );
  return response.data ?? [];
}

export async function getAssignment(assignmentId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendAssignment>>(
    `/api/v1/assignments/${encodeURIComponent(assignmentId)}`,
    { signal },
  );
  return response.data as BackendAssignment;
}

export async function createAssignment(draft: AssignmentDraft) {
  return unwrap(
    await apiRequest<ApiResponse<BackendAssignment>>(`/api/v1/assignments`, {
      method: "POST",
      body: draft,
    }),
  );
}

export async function updateAssignment(assignmentId: string, draft: AssignmentUpdateDraft) {
  return unwrap(
    await apiRequest<ApiResponse<BackendAssignment>>(
      `/api/v1/assignments/${encodeURIComponent(assignmentId)}`,
      { method: "PUT", body: draft },
    ),
  );
}

export async function deleteAssignment(assignmentId: string) {
  return apiRequest<ApiResponse<unknown>>(
    `/api/v1/assignments/${encodeURIComponent(assignmentId)}`,
    {
      method: "DELETE",
    },
  );
}

export async function publishAssignment(assignmentId: string) {
  return unwrap(
    await apiRequest<ApiResponse<BackendAssignment>>(
      `/api/v1/assignments/${encodeURIComponent(assignmentId)}/publish`,
      { method: "POST" },
    ),
  );
}

export async function listAssignmentAttachments(assignmentId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<AssignmentAttachment[]>>(
    `/api/v1/assignments/${encodeURIComponent(assignmentId)}/attachments`,
    { signal },
  );
  return response.data ?? [];
}

export async function uploadAssignmentAttachment(assignmentId: string, file: File) {
  const body = new FormData();
  body.set("file", file);
  return unwrap(
    await apiRequest<ApiResponse<AssignmentAttachment>>(
      `/api/v1/assignments/${encodeURIComponent(assignmentId)}/attachments/upload`,
      { method: "POST", body },
    ),
  );
}

export async function getAssignmentAttachmentDownload(assignmentId: string, attachmentId: string) {
  return unwrap(
    await apiRequest<ApiResponse<AssignmentAttachmentDownload>>(
      `/api/v1/assignments/${encodeURIComponent(assignmentId)}/attachments/${encodeURIComponent(attachmentId)}/download`,
    ),
  );
}

export async function deleteAssignmentAttachment(assignmentId: string, attachmentId: string) {
  return apiRequest<ApiResponse<unknown>>(
    `/api/v1/assignments/${encodeURIComponent(assignmentId)}/attachments/${encodeURIComponent(attachmentId)}`,
    { method: "DELETE" },
  );
}

export async function closeAssignment(assignmentId: string) {
  return unwrap(
    await apiRequest<ApiResponse<BackendAssignment>>(
      `/api/v1/assignments/${encodeURIComponent(assignmentId)}/close`,
      { method: "POST" },
    ),
  );
}

export async function getAssignmentSubmissions(assignmentId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendSubmission[]>>(
    `/api/v1/assignments/${encodeURIComponent(assignmentId)}/submissions`,
    { signal },
  );
  return response.data ?? [];
}

export async function getSubmission(submissionId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendSubmission>>(
    `/api/v1/submissions/${encodeURIComponent(submissionId)}`,
    { signal },
  );
  return response.data as BackendSubmission;
}

export async function gradeSubmission(
  submissionId: string,
  payload: { marks: number; feedback?: string },
) {
  return unwrap(
    await apiRequest<ApiResponse<BackendSubmission>>(
      `/api/v1/submissions/${encodeURIComponent(submissionId)}/grade`,
      { method: "POST", body: payload },
    ),
  );
}

export async function returnSubmission(submissionId: string) {
  return unwrap(
    await apiRequest<ApiResponse<BackendSubmission>>(
      `/api/v1/submissions/${encodeURIComponent(submissionId)}/return`,
      { method: "POST" },
    ),
  );
}

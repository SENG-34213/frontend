import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type BackendAssignmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export type AssignmentRubricInput = { criterion: string; percentageWeight: string };
export type AssignmentRubricItemDraft = { criterion: string; percentageWeight: number };

export function serializeRubricItems(items: AssignmentRubricInput[]): AssignmentRubricItemDraft[] {
  if (!items.length) return [];

  let totalHundredths = 0;
  const rubricItems = items.map((item) => {
    const criterion = item.criterion.trim();
    const rawWeight = item.percentageWeight.trim();
    if (!criterion) throw new Error("Enter a criterion for every rubric percentage.");
    if (!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(rawWeight)) {
      throw new Error("Enter a percentage weight with up to 2 decimal places.");
    }

    const percentageWeight = Number(rawWeight);
    if (percentageWeight < 0 || percentageWeight > 100) {
      throw new Error("Rubric percentage weights must be between 0 and 100.");
    }

    const [whole = "0", fraction = ""] = rawWeight.split(".");
    totalHundredths += Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    return { criterion, percentageWeight };
  });

  if (totalHundredths !== 10000) {
    throw new Error("Rubric percentage weights must total 100%.");
  }
  return rubricItems;
}

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
  rubricItems?: { id?: string; criterion: string; percentageWeight: number; displayOrder?: number }[];
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
  rubricItems?: AssignmentRubricItemDraft[];
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
  studentName?: string | null;
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

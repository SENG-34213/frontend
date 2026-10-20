import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type ExamType = "MIDTERM" | "FINAL" | "PRACTICAL" | "OTHER";
export type ExamStatus = "DRAFT" | "SCHEDULED" | "MARKING" | "COMPLETED" | "CANCELLED";
export type ExamAttendanceStatus = "NOT_MARKED" | "PRESENT" | "ABSENT" | "LATE";

export type BackendExam = {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number | string;
  passMarks: number | string;
  type: ExamType;
  status: ExamStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ExamResult = {
  studentId: string;
  attendanceStatus: ExamAttendanceStatus;
  marksObtained?: number | string;
  resultStatus?: string;
  grade?: string;
  remarks?: string;
  markedAt?: string;
  updatedAt?: string;
};

export type ExamResultSheet = {
  examId: string;
  courseId: string;
  title: string;
  status: ExamStatus;
  totalMarks: number | string;
  passMarks: number | string;
  results: ExamResult[];
};

export type ExamSummary = {
  examId: string;
  courseId: string;
  title: string;
  status: ExamStatus;
  totalMarks: number | string;
  passMarks: number | string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  passedStudents: number;
  failedStudents: number;
  averageMarks?: number | string;
  highestMarks?: number | string;
  lowestMarks?: number | string;
};

export type ExamDraft = {
  courseId: string;
  title: string;
  description?: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passMarks: number;
  type: ExamType;
};

export type ExamUpdateDraft = Omit<ExamDraft, "courseId">;
export type ExamSubmitOptions = {
  instructionFile?: File | null;
  studentVisible?: boolean;
};

export type ExamAttachment = {
  id: string;
  examId: string;
  materialId: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  studentVisible: boolean;
  active: boolean;
  createdAt: string;
};
export type ExamMarkEntry = Pick<
  ExamResult,
  "studentId" | "attendanceStatus" | "marksObtained" | "remarks"
>;

export async function getCourseExams(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendExam[]>>(
    `/api/v1/exams/courses/${encodeURIComponent(courseId)}`,
    { signal },
  );
  return response.data ?? [];
}

export async function getExam(examId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendExam>>(
    `/api/v1/exams/${encodeURIComponent(examId)}`,
    { signal },
  );
  return response.data as BackendExam;
}

function createExamFormData(draft: ExamDraft | ExamUpdateDraft, instructionFile?: File | null) {
  const formData = new FormData();
  formData.append("exam", new Blob([JSON.stringify(draft)], { type: "application/json" }));
  if (instructionFile) formData.append("file", instructionFile);
  return formData;
}

export async function createExam(draft: ExamDraft, options: ExamSubmitOptions = {}) {
  const studentVisible = options.studentVisible ?? true;
  const response = await apiRequest<ApiResponse<BackendExam>>(
    `/api/v1/exams?studentVisible=${studentVisible}`,
    { method: "POST", body: createExamFormData(draft, options.instructionFile) },
  );
  return response.data as BackendExam;
}

export async function updateExam(
  examId: string,
  draft: ExamUpdateDraft,
  options: ExamSubmitOptions = {},
) {
  const studentVisible = options.studentVisible ?? true;
  const response = await apiRequest<ApiResponse<BackendExam>>(
    `/api/v1/exams/${encodeURIComponent(examId)}?studentVisible=${studentVisible}`,
    { method: "PUT", body: createExamFormData(draft, options.instructionFile) },
  );
  return response.data as BackendExam;
}

export async function getExamAttachments(examId: string) {
  const response = await apiRequest<ApiResponse<ExamAttachment[]>>(
    `/api/v1/exams/${encodeURIComponent(examId)}/attachments`,
  );
  return response.data ?? [];
}

export function downloadExamAttachment(examId: string, attachmentId: string) {
  return apiRequest<Blob>(
    `/api/v1/exams/${encodeURIComponent(examId)}/attachments/${encodeURIComponent(attachmentId)}/download`,
    { responseType: "blob" },
  );
}

export async function deleteExamAttachment(examId: string, attachmentId: string) {
  await apiRequest<ApiResponse<unknown>>(
    `/api/v1/exams/${encodeURIComponent(examId)}/attachments/${encodeURIComponent(attachmentId)}`,
    { method: "DELETE" },
  );
}

async function transitionExam(
  examId: string,
  transition: "schedule" | "start-marking" | "complete" | "cancel",
) {
  const response = await apiRequest<ApiResponse<BackendExam>>(
    `/api/v1/exams/${encodeURIComponent(examId)}/${transition}`,
    { method: "POST" },
  );
  return response.data as BackendExam;
}

export const scheduleExam = (examId: string) => transitionExam(examId, "schedule");
export const startExamMarking = (examId: string) => transitionExam(examId, "start-marking");
export const completeExam = (examId: string) => transitionExam(examId, "complete");
export const cancelExam = (examId: string) => transitionExam(examId, "cancel");

export async function getExamResults(examId: string) {
  const response = await apiRequest<ApiResponse<ExamResultSheet>>(
    `/api/v1/exams/${encodeURIComponent(examId)}/results`,
  );
  return response.data as ExamResultSheet;
}

export async function getExamSummary(examId: string) {
  const response = await apiRequest<ApiResponse<ExamSummary>>(
    `/api/v1/exams/${encodeURIComponent(examId)}/summary`,
  );
  return response.data as ExamSummary;
}

export async function enterExamMarks(examId: string, results: ExamMarkEntry[]) {
  const response = await apiRequest<
    ApiResponse<{ examId: string; updatedCount: number; results: ExamResult[] }>
  >(`/api/v1/exams/${encodeURIComponent(examId)}/results`, { method: "PUT", body: { results } });
  return response.data as { examId: string; updatedCount: number; results: ExamResult[] };
}

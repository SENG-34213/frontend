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

export async function createExam(draft: ExamDraft) {
  const response = await apiRequest<ApiResponse<BackendExam>>("/api/v1/exams", {
    method: "POST",
    body: draft,
  });
  return response.data;
}

export async function updateExam(examId: string, draft: ExamUpdateDraft) {
  const response = await apiRequest<ApiResponse<BackendExam>>(
    `/api/v1/exams/${encodeURIComponent(examId)}`,
    { method: "PUT", body: draft },
  );
  return response.data;
}

async function transitionExam(
  examId: string,
  transition: "schedule" | "start-marking" | "complete" | "cancel",
) {
  const response = await apiRequest<ApiResponse<BackendExam>>(
    `/api/v1/exams/${encodeURIComponent(examId)}/${transition}`,
    { method: "POST" },
  );
  return response.data;
}

export const scheduleExam = (examId: string) => transitionExam(examId, "schedule");
export const startExamMarking = (examId: string) => transitionExam(examId, "start-marking");
export const completeExam = (examId: string) => transitionExam(examId, "complete");
export const cancelExam = (examId: string) => transitionExam(examId, "cancel");

export async function getExamResults(examId: string) {
  const response = await apiRequest<ApiResponse<ExamResultSheet>>(
    `/api/v1/exams/${encodeURIComponent(examId)}/results`,
  );
  return response.data;
}

export async function getExamSummary(examId: string) {
  const response = await apiRequest<ApiResponse<ExamSummary>>(
    `/api/v1/exams/${encodeURIComponent(examId)}/summary`,
  );
  return response.data;
}

export async function enterExamMarks(examId: string, results: ExamMarkEntry[]) {
  const response = await apiRequest<
    ApiResponse<{ examId: string; updatedCount: number; results: ExamResult[] }>
  >(`/api/v1/exams/${encodeURIComponent(examId)}/results`, { method: "PUT", body: { results } });
  return response.data;
}

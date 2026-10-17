import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type BackendExamStatus = "DRAFT" | "SCHEDULED" | "MARKING" | "COMPLETED" | "CANCELLED";
export type BackendExamType = "MIDTERM" | "FINAL" | "PRACTICAL" | "OTHER";

export type BackendExam = {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passMarks: number;
  type: BackendExamType;
  status: BackendExamStatus;
};

export type ExamRequest = {
  courseId: string;
  title: string;
  description?: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passMarks: number;
  type: BackendExamType;
};

export type ExamResult = {
  studentId: string;
  attendanceStatus: "PRESENT" | "ABSENT";
  marksObtained?: number;
  resultStatus: "NOT_MARKED" | "PASS" | "FAIL";
  grade?: string;
  remarks?: string;
};

export type ExamResultSheet = {
  examId: string;
  courseId: string;
  title: string;
  status: BackendExamStatus;
  totalMarks: number;
  passMarks: number;
  results: ExamResult[];
};

export type ExamSummary = {
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  passedStudents: number;
  failedStudents: number;
  averageMarks?: number;
  highestMarks?: number;
  lowestMarks?: number;
};

async function examAction(examId: string, action: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendExam>>(`/api/v1/exams/${examId}/${action}`, {
    method: "POST",
    signal,
  });
  return response.data;
}

export async function getExamsByCourse(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<BackendExam[]>>(
    `/api/v1/exams/courses/${courseId}`,
    {
      signal,
    },
  );
  return response.data ?? [];
}

export async function createExam(request: ExamRequest) {
  const response = await apiRequest<ApiResponse<BackendExam>>("/api/v1/exams", {
    method: "POST",
    body: request,
  });
  return response.data;
}

export async function updateExam(examId: string, request: Omit<ExamRequest, "courseId">) {
  const response = await apiRequest<ApiResponse<BackendExam>>(`/api/v1/exams/${examId}`, {
    method: "PUT",
    body: request,
  });
  return response.data;
}

export async function scheduleExam(examId: string) {
  return examAction(examId, "schedule");
}

export async function startExamMarking(examId: string) {
  return examAction(examId, "start-marking");
}

export async function completeExam(examId: string) {
  return examAction(examId, "complete");
}

export async function cancelExam(examId: string) {
  return examAction(examId, "cancel");
}

export async function getExamResultSheet(examId: string) {
  const response = await apiRequest<ApiResponse<ExamResultSheet>>(
    `/api/v1/exams/${examId}/results`,
  );
  return response.data;
}

export async function getExamSummary(examId: string) {
  const response = await apiRequest<ApiResponse<ExamSummary>>(`/api/v1/exams/${examId}/summary`);
  return response.data;
}

export async function enterExamMarks(examId: string, results: ExamResult[]) {
  const response = await apiRequest<ApiResponse<unknown>>(`/api/v1/exams/${examId}/results`, {
    method: "PUT",
    body: {
      results: results.map(({ studentId, attendanceStatus, marksObtained, remarks }) => ({
        studentId,
        attendanceStatus,
        marksObtained,
        remarks,
      })),
    },
  });
  return response.data;
}

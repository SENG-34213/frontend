import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type TeacherGradebookItem = {
  assessmentId: string;
  title: string;
  score?: number | string | null;
  maxScore?: number | string | null;
  percentage?: number | string | null;
  status?: string | null;
  marksObtained?: number | string | null;
  maxMarks?: number | string | null;
};

export type TeacherGradebookStudent = {
  studentId: string;
  studentNumber?: string | null;
  studentName?: string | null;
  email?: string | null;
  assignments: TeacherGradebookItem[];
  quizzes: TeacherGradebookItem[];
  exams: TeacherGradebookItem[];
  assignmentScores?: TeacherGradebookItem[];
  quizScores?: TeacherGradebookItem[];
  examScores?: TeacherGradebookItem[];
  total?: number | string | null;
  percentage?: number | string | null;
  grade?: string | null;
  overallPercentage?: number | string | null;
  letterGrade?: string | null;
  status?: string | null;
};

export type TeacherGradebook = {
  courseId: string;
  courseName?: string | null;
  gradingScale?: Record<string, number>;
  students: TeacherGradebookStudent[];
  summary?: {
    studentCount: number;
    averagePercentage?: number | string | null;
    highestPercentage?: number | string | null;
    atRiskCount: number;
  } | null;
};

export type TeacherGradebookQuiz = {
  quizId: string;
  title: string;
  startTime?: string | null;
  totalMarks?: number | string | null;
  results: Array<{
    studentId: string;
    score?: number | string | null;
    percentage?: number | string | null;
  }>;
};

export async function getTeacherGradebook(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<TeacherGradebook>>(
    `/api/v1/teacher/gradebook?courseId=${encodeURIComponent(courseId)}`,
    { signal },
  );
  return response.data ?? null;
}

export async function getTeacherGradebookQuizzes(courseId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<TeacherGradebookQuiz[]>>(
    `/api/v1/teacher/gradebook/quizzes?courseId=${encodeURIComponent(courseId)}`,
    { signal },
  );
  return response.data ?? [];
}

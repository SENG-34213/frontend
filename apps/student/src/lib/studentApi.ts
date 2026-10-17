export type ApiEnvelope<T> = { data?: T; message?: string; error?: string };
export type Student = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  accountStatus?: string;
  studentProfile?: { studentId?: string; grade?: string; attendanceMode?: string };
};
export type Course = {
  id: string;
  courseName: string;
  courseDescription?: string;
  courseThumbnail?: string;
  courseFeeMonthly?: number;
  subject?: string;
  gradeId?: string;
  online?: boolean;
  visible?: boolean;
  isPublished?: boolean;
  courseStatus?: string;
  numberOfStudents?: number;
};
export type Assignment = {
  id: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description?: string;
  instructions?: string;
  startDate?: string;
  dueDate?: string;
  maxMarks?: number;
  allowedAttempts?: number;
  allowLateSubmission?: boolean;
  status?: string;
};
export type Submission = {
  id: string;
  assignmentId?: string;
  attemptNumber?: number;
  status?: string;
  content?: string;
  marks?: number;
  submittedAt?: string;
  feedback?: string;
  isLate?: boolean;
};
export type Group = {
  id: string;
  name?: string;
  description?: string;
  memberCount?: number;
  courseId?: string;
  archived?: boolean;
};
export type Quiz = {
  id: string;
  title?: string;
  description?: string;
  courseId?: string;
  startTime?: string;
  endTime?: string;
  totalMarks?: number;
  passMark?: number;
  durationMinutes?: number;
  maxAttempts?: number;
  questions?: number;
  status?: string;
};
export type Attendance = {
  studentId?: string;
  courseId?: string;
  completedSessions?: number;
  presentCount?: number;
  lateCount?: number;
  absentCount?: number;
  attendedCount?: number;
  attendancePercentage?: number;
  percentage?: number;
  totalSessions?: number;
};
export type ExamResult = {
  examId: string;
  courseId?: string;
  title: string;
  examDate?: string;
  type?: string;
  examStatus?: string;
  totalMarks?: number;
  passMarks?: number;
  attendanceStatus?: string;
  marksObtained?: number;
  resultStatus?: string;
  grade?: string;
  remarks?: string;
};
export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  startDateTime: string;
  endDateTime?: string;
  allDay: boolean;
  courseId?: string;
  sourceType?: string;
  status?: string;
  location?: string;
};
export type Material = {
  id: string;
  title: string;
  description?: string;
  type?: string;
  purpose?: string;
  status?: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  fileName?: string;
  fileSize?: number;
};
export type Payment = {
  paymentId: string;
  courseId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  paidAt?: string;
  refundedAt?: string;
  createdAt?: string;
};
export type QuizQuestion = {
  id: string;
  questionText?: string;
  options?: Array<{ id: string; optionText?: string }>;
};
export type StudentQuiz = Quiz & { questions?: QuizQuestion[] };

const read = <T>(payload: ApiEnvelope<T> | T): T =>
  payload && typeof payload === "object" && "data" in payload && payload.data !== undefined
    ? (payload.data as T)
    : (payload as T);
export function getApiUrl() {
  if (typeof window === "undefined")
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return (
    sessionStorage.getItem("mentify_api_url") ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  ).replace(/\/$/, "");
}
export function getToken() {
  return typeof window === "undefined" ? "" : sessionStorage.getItem("mentify_access_token") || "";
}
export async function login(identifier: string, password: string, apiUrl: string) {
  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      payload.message || payload.error || "Unable to sign in. Check your email and password.",
    );
  const result = (payload.data || payload) as {
    accessToken?: string;
    refreshToken?: string;
    user?: { role?: string };
  };
  if (!result.accessToken) throw new Error("The login response did not include an access token.");
  return result;
}
export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(payload.message || payload.error || `Request failed (${response.status})`);
  return read<T>(payload);
}
export const studentApi = {
  me: () => apiRequest<Student>("/api/v1/users/me"),
  courseIds: (studentId: string) =>
    apiRequest<string[]>(`/api/v1/enrollments/students/${encodeURIComponent(studentId)}/courses`),
  course: (courseId: string) =>
    apiRequest<Course>(`/api/v1/course/${encodeURIComponent(courseId)}/lookup`),
  groups: () => apiRequest<Group[]>("/api/communication/groups"),
  groupMembers: (groupId: string) =>
    apiRequest<Array<{ userId?: string; role?: string }>>(
      `/api/communication/groups/${encodeURIComponent(groupId)}/members`,
    ),
  messages: (groupId: string) =>
    apiRequest<{
      content?: Array<{ id: string; senderId?: string; content?: string; sentAt?: string }>;
    }>(`/api/communication/groups/${encodeURIComponent(groupId)}/messages?page=0&size=50`),
  sendMessage: (groupId: string, content: string) =>
    apiRequest(`/api/communication/groups/${encodeURIComponent(groupId)}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  submissions: () => apiRequest<Submission[]>("/api/v1/submissions/my"),
  assignments: (courseId: string) =>
    apiRequest<Assignment[]>(`/api/v1/courses/${encodeURIComponent(courseId)}/assignments`),
  createSubmission: (assignmentId: string, content: string) =>
    apiRequest<Submission>(`/api/v1/assignments/${encodeURIComponent(assignmentId)}/submissions`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  updateSubmission: (submissionId: string, content: string) =>
    apiRequest<Submission>(`/api/v1/submissions/${encodeURIComponent(submissionId)}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),
  submitAssignment: (submissionId: string) =>
    apiRequest<Submission>(`/api/v1/submissions/${encodeURIComponent(submissionId)}/submit`, {
      method: "POST",
    }),
  quizzes: (courseId: string) =>
    apiRequest<Quiz[]>(`/api/courses/${encodeURIComponent(courseId)}/quizzes`),
  quiz: (quizId: string) =>
    apiRequest<StudentQuiz>(`/api/quizzes/${encodeURIComponent(quizId)}/student`),
  startQuiz: (quizId: string) =>
    apiRequest<{ attemptId: string; quizId: string; attemptNumber: number }>(
      `/api/quizzes/${encodeURIComponent(quizId)}/attempts`,
      { method: "POST" },
    ),
  saveQuizAnswer: (attemptId: string, questionId: string, selectedOptionId: string) =>
    apiRequest(`/api/quiz-attempts/${encodeURIComponent(attemptId)}/answers`, {
      method: "PUT",
      body: JSON.stringify({ questionId, selectedOptionId }),
    }),
  submitQuiz: (attemptId: string) =>
    apiRequest(`/api/quiz-attempts/${encodeURIComponent(attemptId)}/submit`, { method: "POST" }),
  attendance: (courseId: string) =>
    apiRequest<Attendance>(`/api/v1/attendance/courses/${encodeURIComponent(courseId)}/me`),
  examResults: () => apiRequest<{ results: ExamResult[] }>("/api/v1/exams/me"),
  upcomingEvents: (limit = 30) =>
    apiRequest<CalendarEvent[]>(`/api/v1/calendar/upcoming?limit=${limit}`),
  materials: (courseId?: string) =>
    apiRequest<{ content?: Material[] }>(
      `/api/v1/materials?size=50${courseId ? `&courseId=${encodeURIComponent(courseId)}` : ""}`,
    ),
  downloadMaterial: (materialId: string) =>
    apiRequest<{ downloadUrl?: string; url?: string }>(
      `/api/v1/materials/${encodeURIComponent(materialId)}/download`,
    ),
  payments: () => apiRequest<Payment[]>("/api/v1/payments/me"),
  startPayment: (courseId: string) =>
    apiRequest<{ paymentId: string; clientSecret?: string; status?: string }>(
      "/api/v1/payments/course",
      { method: "POST", body: JSON.stringify({ courseId }) },
    ),
  enroll: (courseId: string) =>
    apiRequest(`/api/v1/enrollments/me`, { method: "POST", body: JSON.stringify({ courseId }) }),
};
export function configuredCourseIds() {
  if (typeof window === "undefined") return [];
  const raw =
    sessionStorage.getItem("mentify_student_course_ids") ||
    process.env.NEXT_PUBLIC_STUDENT_COURSE_IDS ||
    "";
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

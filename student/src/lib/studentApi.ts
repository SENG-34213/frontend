/**
 * Mentify Student Portal API Client
 * Integrates with Mentify backend microservices through the API Gateway (port 8080)
 */

export interface ApiResponseEnvelope<T> {
  statusCode?: number;
  status?: string | number;
  message?: string;
  data?: T;
  timestamp?: string;
}

export interface UserRegistrationResponse {
  id: string;
  keycloakUserId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  accountStatus?: string;
  studentProfile?: {
    id?: string;
    studentId?: string;
    grade?: string;
    dateOfBirth?: string;
    guardianName?: string;
    guardianPhone?: string;
    attendanceMode?: string;
  };
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    district?: string;
    postalCode?: string;
  };
}

export interface BackendCourse {
  id: string;
  courseName: string;
  courseDescription?: string;
  courseThumbnail?: string;
  courseFeeMonthly?: number;
  assignedTeacherId?: string;
  gradeId?: string;
  subject?: string;
  online?: boolean;
  visible?: boolean;
  isPublished?: boolean;
  courseStatus?: string;
  numberOfStudents?: number;
}

export interface BackendModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  sequenceOrder?: number;
  dateDuration?: number;
  isVisible?: boolean;
  lessons?: BackendLesson[];
}

export interface BackendLesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  releaseDate?: string;
  isVisible?: boolean;
  completed?: boolean;
}

export interface BackendAssignment {
  id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate: string;
  maxMarks: number;
  status: string;
  allowedAttempts?: number;
  allowLateSubmission?: boolean;
}

export interface BackendSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  attemptNumber?: number;
  status: string;
  content?: string;
  marks?: number;
  submittedAt?: string;
  feedback?: string;
  isLate?: boolean;
}

export interface BackendQuiz {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  totalMarks: number;
  passMark: number;
  durationMinutes: number;
  maxAttempts: number;
  status: string;
  questions?: BackendQuizQuestion[];
}

export interface BackendQuizQuestion {
  id: string;
  questionText: string;
  marks?: number;
  questionOrder?: number;
  options: Array<{
    id: string;
    optionText: string;
    optionOrder?: number;
  }>;
}

export interface BackendAttendanceSummary {
  studentId: string;
  courseId: string;
  completedSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendedCount: number;
  attendancePercentage: number;
}

export interface BackendExamResult {
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
}

export interface BackendCalendarEvent {
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
}

export interface BackendMaterial {
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
  createdAt?: string;
}

export interface BackendPayment {
  paymentId: string;
  courseId?: string;
  courseName?: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

export interface BackendGroup {
  id: string;
  courseId?: string;
  name: string;
  description?: string;
  status?: string;
}

export interface BackendMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  sentAt?: string;
}

export interface BackendNotification {
  id: string;
  title: string;
  message?: string;
  description?: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function getApiUrl(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  }
  return (
    sessionStorage.getItem("mentify_api_url") ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  ).replace(/\/$/, "");
}

export function setApiUrl(url: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("mentify_api_url", url);
  }
}

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("mentify_access_token") || "";
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("mentify_access_token", token);
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("mentify_access_token");
    sessionStorage.removeItem("mentify_refresh_token");
  }
}

const extractData = <T>(payload: ApiResponseEnvelope<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
};

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const url = `${getApiUrl()}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg =
      payload.message ||
      payload.error ||
      `Request to ${path} failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return extractData<T>(payload);
}

export async function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const url = `${getApiUrl()}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      payload.message || payload.error || `Upload failed with status ${response.status}`,
    );
  }

  return extractData<T>(payload);
}

export const studentApi = {
  // Authentication & Session
  login: async (identifier: string, password: string, apiUrl?: string) => {
    const baseUrl = (apiUrl || getApiUrl()).replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || payload.error || "Invalid student login credentials");
    }

    const result = extractData<{
      accessToken?: string;
      refreshToken?: string;
      user?: { id?: string; email?: string; role?: string };
    }>(payload);

    if (result.accessToken) {
      setToken(result.accessToken);
      if (apiUrl) setApiUrl(apiUrl);
      if (result.refreshToken && typeof window !== "undefined") {
        sessionStorage.setItem("mentify_refresh_token", result.refreshToken);
      }
    }
    return result;
  },

  logout: async () => {
    try {
      const refreshToken =
        typeof window !== "undefined" ? sessionStorage.getItem("mentify_refresh_token") || "" : "";
      if (refreshToken) {
        await apiRequest("/api/v1/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
      }
    } finally {
      clearToken();
    }
  },

  // Student Profile
  me: () => apiRequest<UserRegistrationResponse>("/api/v1/users/me"),

  // Enrollments & Courses
  courseIds: (studentId: string) =>
    apiRequest<string[]>(`/api/v1/enrollments/students/${encodeURIComponent(studentId)}/courses`),

  course: (courseId: string) =>
    apiRequest<BackendCourse>(`/api/v1/course/${encodeURIComponent(courseId)}/lookup`),

  allCourses: () =>
    apiRequest<BackendCourse[]>("/api/v1/course/bulk", {
      method: "POST",
      body: JSON.stringify({ ids: [] }),
    }).catch(() => [] as BackendCourse[]),

  enroll: (courseId: string) =>
    apiRequest("/api/v1/enrollments/me", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    }),

  // Course Curriculum
  modules: (courseId: string) =>
    apiRequest<BackendModule[]>(`/api/v1/course/${encodeURIComponent(courseId)}/modules`),

  lessons: (courseId: string, moduleId: string) =>
    apiRequest<BackendLesson[]>(
      `/api/v1/course/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons`,
    ),

  // Assignments & Submissions
  assignments: (courseId: string) =>
    apiRequest<BackendAssignment[]>(`/api/v1/courses/${encodeURIComponent(courseId)}/assignments`),

  assignment: (assignmentId: string) =>
    apiRequest<BackendAssignment>(`/api/v1/assignments/${encodeURIComponent(assignmentId)}`),

  submissions: () => apiRequest<BackendSubmission[]>("/api/v1/submissions/my"),

  createSubmission: (assignmentId: string, content: string) =>
    apiRequest<BackendSubmission>(
      `/api/v1/assignments/${encodeURIComponent(assignmentId)}/submissions`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      },
    ),

  updateSubmission: (submissionId: string, content: string) =>
    apiRequest<BackendSubmission>(`/api/v1/submissions/${encodeURIComponent(submissionId)}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),

  submitAssignment: (submissionId: string) =>
    apiRequest<BackendSubmission>(
      `/api/v1/submissions/${encodeURIComponent(submissionId)}/submit`,
      { method: "POST" },
    ),

  // Quizzes & Attempts
  quizzes: (courseId: string) =>
    apiRequest<BackendQuiz[]>(`/api/courses/${encodeURIComponent(courseId)}/quizzes`),

  quiz: (quizId: string) =>
    apiRequest<BackendQuiz>(`/api/quizzes/${encodeURIComponent(quizId)}/student`),

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
    apiRequest<{ score?: number; totalMarks?: number; percentage?: number }>(
      `/api/quiz-attempts/${encodeURIComponent(attemptId)}/submit`,
      { method: "POST" },
    ),

  // Examinations & Results
  examResults: () => apiRequest<{ results: BackendExamResult[] }>("/api/v1/exams/me"),

  // Calendar
  upcomingEvents: (limit = 30) =>
    apiRequest<BackendCalendarEvent[]>(`/api/v1/calendar/upcoming?limit=${limit}`),

  calendarEvents: (startIso: string, endIso: string) =>
    apiRequest<BackendCalendarEvent[]>(
      `/api/v1/calendar/events?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`,
    ),

  // Learning Materials
  materials: (courseId?: string) =>
    apiRequest<{ content?: BackendMaterial[] } | BackendMaterial[]>(
      `/api/v1/materials?size=50${courseId ? `&courseId=${encodeURIComponent(courseId)}` : ""}`,
    ).then((res) => ("content" in res && res.content ? res.content : (res as BackendMaterial[]))),

  downloadMaterial: (materialId: string) =>
    apiRequest<{ downloadUrl?: string; url?: string }>(
      `/api/v1/materials/${encodeURIComponent(materialId)}/download`,
    ),

  // Communication & Messaging
  groups: () => apiRequest<BackendGroup[]>("/api/communication/groups"),

  messages: (groupId: string, page = 0, size = 50) =>
    apiRequest<{ content?: BackendMessage[] }>(
      `/api/communication/groups/${encodeURIComponent(groupId)}/messages?page=${page}&size=${size}`,
    ).then((res) => res.content || []),

  sendMessage: (groupId: string, content: string) =>
    apiRequest<BackendMessage>(
      `/api/communication/groups/${encodeURIComponent(groupId)}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      },
    ),

  // Attendance
  attendance: (courseId: string) =>
    apiRequest<BackendAttendanceSummary>(
      `/api/v1/attendance/courses/${encodeURIComponent(courseId)}/me`,
    ),

  // Notifications
  notifications: (unreadOnly = false) =>
    apiRequest<{ content?: BackendNotification[]; unreadCount?: number }>(
      `/api/v1/notifications?size=50&unreadOnly=${unreadOnly}`,
    ).then((res) => res.content || []),

  unreadNotificationCount: () => apiRequest<number>("/api/v1/notifications/unread-count"),

  markNotificationRead: (notificationId: string) =>
    apiRequest(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: "PATCH",
    }),

  markAllNotificationsRead: () =>
    apiRequest<number>("/api/v1/notifications/read-all", {
      method: "PATCH",
    }),

  // Payments
  payments: () => apiRequest<BackendPayment[]>("/api/v1/payments/me"),

  startPayment: (courseId: string) =>
    apiRequest<{ paymentId: string; clientSecret?: string; status?: string }>(
      "/api/v1/payments/course",
      {
        method: "POST",
        body: JSON.stringify({ courseId }),
      },
    ),

  paymentStatus: (paymentId: string) =>
    apiRequest<{ paymentId: string; status: string }>(
      `/api/v1/payments/${encodeURIComponent(paymentId)}/status`,
    ),

  // AI Assistant Chat
  aiChat: (message: string, conversationId?: string) =>
    apiRequest<{ response: string; conversationId?: string }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, conversationId }),
    }),
};

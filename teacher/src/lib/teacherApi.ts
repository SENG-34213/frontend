export type TeacherProfile = {
  id: string;
  keycloakUserId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  accountStatus?: string;
  teacherProfile?: {
    id?: string;
    teacherCode?: string;
    specializations?: string[];
  };
};

export type TeacherCourse = {
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
};

export type CourseModule = {
  id: string;
  title: string;
  description?: string;
  sequenceOrder?: number;
  dateDuration?: number;
  isVisible?: boolean;
};

export type CourseLesson = {
  id: string;
  title: string;
  description?: string;
  releaseDate?: string;
  isVisible?: boolean;
};

export type CommunicationGroup = { id: string; courseId: string; name: string; description?: string; status?: string };
export type GroupMember = { userId: string; role?: string; joinedAt?: string };
export type CommunicationMessage = { id: string; groupId: string; senderId: string; content: string; sentAt?: string; edited?: boolean; deletedForEveryone?: boolean };
export type QuizOptionDraft = { optionText: string; correct: boolean; optionOrder: number };
export type QuizQuestionDraft = { id?: string; questionText: string; questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER"; marks: number; questionOrder: number; options: QuizOptionDraft[] };
export type TeacherQuiz = { id: string; courseId: string; title: string; description?: string; durationMinutes: number; totalMarks: number; passMark: number; maxAttempts: number; status: "DRAFT" | "PUBLISHED"; creationMethod?: "MANUAL" | "AI_GENERATED"; questions?: QuizQuestionDraft[] };
export type AiQuizDraft = { courseId: string; questionCount: number; difficulty: "EASY" | "MEDIUM" | "HARD"; questionType: "MULTIPLE_CHOICE_SINGLE_ANSWER"; creationMethod: "AI_GENERATED"; questions: QuizQuestionDraft[]; provider?: string; model?: string };

function apiBase() {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("mentify_api_url") || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
}

async function request<T>(path: string, init: RequestInit = {}) {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("mentify_access_token") || "" : "";
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}), Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(response.status === 401 ? `401: ${body.message || body.error || "Authentication required."}` : (body.message || body.error || `The service returned ${response.status}.`));
  return (body.data ?? body) as T;
}

async function upload<T>(path: string, formData: FormData) {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("mentify_access_token") || "" : "";
  const response = await fetch(`${apiBase()}${path}`, { method: "POST", body: formData, headers: { Authorization: `Bearer ${token}` } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(response.status === 401 ? `401: ${body.message || body.error || "Authentication required."}` : (body.message || body.error || `The service returned ${response.status}.`));
  return (body.data ?? body) as T;
}

export const teacherApi = {
  profile: () => request<TeacherProfile>("/api/v1/users/me"),
  courses: () => request<TeacherCourse[]>("/api/v1/course/my-courses"),
  modules: (courseId: string) => request<CourseModule[]>(`/api/v1/course/${encodeURIComponent(courseId)}/modules`),
  createModule: (courseId: string, draft: { title: string; description: string; sequenceOrder: number }) => request<CourseModule>(`/api/v1/course/${encodeURIComponent(courseId)}/modules`, { method: "POST", body: JSON.stringify({ ...draft, isVisible: true }) }),
  lessons: (courseId: string, moduleId: string) => request<CourseLesson[]>(`/api/v1/course/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons`),
  createLesson: (courseId: string, moduleId: string, draft: { title: string; description: string }) => request<CourseLesson>(`/api/v1/course/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons`, { method: "POST", body: JSON.stringify({ ...draft, isVisible: true }) }),
  groups: () => request<CommunicationGroup[]>("/api/communication/groups"),
  groupMembers: (groupId: string) => request<GroupMember[]>(`/api/communication/groups/${encodeURIComponent(groupId)}/members`),
  messages: (groupId: string) => request<{ content: CommunicationMessage[] }>(`/api/communication/groups/${encodeURIComponent(groupId)}/messages?page=0&size=50`),
  createGroup: (draft: { courseId: string; name: string; description: string }) => request<CommunicationGroup>("/api/communication/groups", { method: "POST", body: JSON.stringify(draft) }),
  sendMessage: (groupId: string, content: string) => request<CommunicationMessage>(`/api/communication/groups/${encodeURIComponent(groupId)}/messages`, { method: "POST", body: JSON.stringify({ content }) }),
  createQuiz: (draft: { courseId: string; title: string; description: string; durationMinutes: number; passMark: number; maxAttempts: number; creationMethod: "MANUAL" | "AI_GENERATED" }) => request<TeacherQuiz>("/api/quizzes", { method: "POST", body: JSON.stringify({ ...draft, showResultImmediately: true }) }),
  quizzes: () => request<TeacherQuiz[]>("/api/quizzes/teacher"),
  updateQuiz: (quizId: string, draft: { title: string; description: string; durationMinutes: number; passMark: number; maxAttempts: number }) => request<TeacherQuiz>(`/api/quizzes/${encodeURIComponent(quizId)}`, { method: "PUT", body: JSON.stringify({ ...draft, showResultImmediately: true }) }),
  createQuestion: (quizId: string, draft: QuizQuestionDraft) => request<QuizQuestionDraft>(`/api/quizzes/${encodeURIComponent(quizId)}/questions`, { method: "POST", body: JSON.stringify(draft) }),
  updateQuestion: (quizId: string, questionId: string, draft: QuizQuestionDraft) => request<QuizQuestionDraft>(`/api/quizzes/${encodeURIComponent(quizId)}/questions/${encodeURIComponent(questionId)}`, { method: "PUT", body: JSON.stringify(draft) }),
  deleteQuiz: (quizId: string) => request<null>(`/api/quizzes/${encodeURIComponent(quizId)}`, { method: "DELETE" }),
  publishQuiz: (quizId: string) => request<TeacherQuiz>(`/api/quizzes/${encodeURIComponent(quizId)}/publish`, { method: "POST" }),
  generateQuizDraft: (file: File, options: { courseId: string; questionCount: number; difficulty: "EASY" | "MEDIUM" | "HARD"; userPrompt: string }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", options.courseId);
    formData.append("questionCount", String(options.questionCount));
    formData.append("difficulty", options.difficulty);
    formData.append("questionType", "MULTIPLE_CHOICE_SINGLE_ANSWER");
    if (options.userPrompt.trim()) formData.append("userPrompt", options.userPrompt.trim());
    return upload<AiQuizDraft>("/api/assignments/quizzes/ai/generate", formData);
  },
};

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

export const teacherApi = {
  profile: () => request<TeacherProfile>("/api/v1/users/me"),
  courses: () => request<TeacherCourse[]>("/api/v1/course/my-courses"),
  modules: (courseId: string) => request<CourseModule[]>(`/api/v1/course/${encodeURIComponent(courseId)}/modules`),
  createModule: (courseId: string, draft: { title: string; description: string; sequenceOrder: number }) => request<CourseModule>(`/api/v1/course/${encodeURIComponent(courseId)}/modules`, { method: "POST", body: JSON.stringify({ ...draft, isVisible: true }) }),
  lessons: (courseId: string, moduleId: string) => request<CourseLesson[]>(`/api/v1/course/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons`),
  createLesson: (courseId: string, moduleId: string, draft: { title: string; description: string }) => request<CourseLesson>(`/api/v1/course/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons`, { method: "POST", body: JSON.stringify({ ...draft, isVisible: true }) }),
};

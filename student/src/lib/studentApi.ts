export type ApiEnvelope<T> = { data?: T; message?: string; error?: string };
export type Student = { id?: string; email?: string; firstName?: string; lastName?: string; phoneNumber?: string; role?: string; accountStatus?: string; studentProfile?: { studentId?: string; grade?: string; attendanceMode?: string } };
export type Assignment = { id: string; courseId?: string; title: string; description?: string; dueDate?: string; maxMarks?: number; status?: string };
export type Submission = { id: string; assignmentId?: string; status?: string; marks?: number; submittedAt?: string; feedback?: string };
export type Group = { id: string; name?: string; description?: string; memberCount?: number; courseId?: string; archived?: boolean };
export type Quiz = { id: string; title?: string; description?: string; courseId?: string; dueDate?: string; questions?: number; status?: string };
export type Attendance = { percentage?: number; presentCount?: number; absentCount?: number; totalSessions?: number };

const read = <T>(payload: ApiEnvelope<T> | T): T => payload && typeof payload === "object" && "data" in payload && payload.data !== undefined ? payload.data as T : payload as T;
export function getApiUrl() { if (typeof window === "undefined") return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"; return (sessionStorage.getItem("mentify_api_url") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, ""); }
export function getToken() { return typeof window === "undefined" ? "" : sessionStorage.getItem("mentify_access_token") || ""; }
export async function login(identifier: string, password: string, apiUrl: string) {
  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password }) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || "Unable to sign in. Check your email and password.");
  const result = (payload.data || payload) as { accessToken?: string; refreshToken?: string; user?: { role?: string } };
  if (!result.accessToken) throw new Error("The login response did not include an access token.");
  return result;
}
export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(`${getApiUrl()}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || `Request failed (${response.status})`);
  return read<T>(payload);
}
export const studentApi = { me: () => apiRequest<Student>("/api/v1/users/me"), groups: () => apiRequest<Group[]>("/api/communication/groups"), submissions: () => apiRequest<Submission[]>("/api/v1/submissions/my"), assignments: (courseId: string) => apiRequest<Assignment[]>(`/api/v1/courses/${courseId}/assignments`), quizzes: (courseId: string) => apiRequest<Quiz[]>(`/api/courses/${courseId}/quizzes`), attendance: (courseId: string) => apiRequest<Attendance>(`/api/v1/attendance/courses/${courseId}/me`) };
export function configuredCourseIds() { if (typeof window === "undefined") return []; const raw = sessionStorage.getItem("mentify_student_course_ids") || process.env.NEXT_PUBLIC_STUDENT_COURSE_IDS || ""; return raw.split(",").map((id) => id.trim()).filter(Boolean); }

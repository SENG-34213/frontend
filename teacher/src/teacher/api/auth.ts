import { ApiError, apiRequest } from "./client";
import { clearSession, getSession, saveSession } from "../auth/authStorage";
import type {
  ApiResponse,
  AuthSession,
  LoginResponse,
  TeacherUserSummary,
} from "../auth/authTypes";

export async function loginTeacher(identifier: string, password: string): Promise<AuthSession> {
  const response = await apiRequest<ApiResponse<LoginResponse>>("/api/v1/auth/login", {
    method: "POST",
    authenticated: false,
    body: { identifier, password },
  });
  const data = response.data;
  const user = data?.profile ?? data?.user;
  const role = typeof user?.role === "string" ? user.role.trim().toUpperCase() : "";
  if (!data?.accessToken || !user || role !== "TEACHER") {
    throw new Error("This account does not have access to the teacher workspace.");
  }

  const session: AuthSession = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user,
    expiresAt: Date.now() + data.expiresIn * 1000,
  };
  saveSession(session);
  return session;
}

export async function getCurrentTeacher() {
  try {
    const response = await apiRequest<ApiResponse<TeacherUserSummary>>("/api/v1/users/me");
    const role = typeof response.data?.role === "string" ? response.data.role.trim().toUpperCase() : "";
    if (role !== "TEACHER") {
      clearSession();
      throw new Error("This account does not have access to the teacher workspace.");
    }
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      clearSession();
    }
    throw error;
  }
}

export async function logoutTeacher() {
  const refreshToken = getSession()?.refreshToken;
  try {
    if (refreshToken) {
      await apiRequest<ApiResponse<null>>("/api/v1/auth/logout", {
        method: "POST",
        authenticated: false,
        body: { refreshToken },
        retryOnUnauthorized: false,
      });
    }
  } finally {
    clearSession();
  }
}

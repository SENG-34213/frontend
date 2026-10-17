import { apiRequest } from "./client";
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
  if (!data?.accessToken || !data.user || data.user.role !== "TEACHER") {
    throw new Error("This account does not have access to the teacher workspace.");
  }

  const session: AuthSession = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
    expiresAt: Date.now() + data.expiresIn * 1000,
  };
  saveSession(session);
  return session;
}

export async function getCurrentTeacher() {
  const response = await apiRequest<ApiResponse<TeacherUserSummary>>("/api/v1/users/me");
  if (response.data?.role !== "TEACHER") {
    clearSession();
    throw new Error("This account does not have access to the teacher workspace.");
  }
  return response.data;
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

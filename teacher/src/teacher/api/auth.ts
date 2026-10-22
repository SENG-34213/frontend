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
    mustChangePassword: Boolean(data.mustChangePassword ?? user.mustChangePassword),
  };
  saveSession(session);
  return session;
}

export async function changeTeacherPassword(currentPassword: string, newPassword: string) {
  return apiRequest<ApiResponse<null>>("/api/v1/users/me/password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });
}

export async function requestTeacherPasswordReset(email: string) {
  return apiRequest<ApiResponse<null>>("/api/v1/auth/forgot-password", {
    method: "POST",
    authenticated: false,
    retryOnUnauthorized: false,
    credentials: "omit",
    cache: "no-store",
    body: { email },
  });
}

export async function verifyTeacherPasswordResetOtp(email: string, otp: string) {
  const response = await apiRequest<ApiResponse<{ resetToken: string }>>(
    "/api/v1/auth/forgot-password/verify",
    {
      method: "POST",
      authenticated: false,
      retryOnUnauthorized: false,
      credentials: "omit",
      cache: "no-store",
      body: { email, otp },
    },
  );
  if (!response.data?.resetToken)
    throw new Error("The reset token was not returned by the server.");
  return response.data.resetToken;
}

export async function resetTeacherPassword(resetToken: string, newPassword: string) {
  return apiRequest<ApiResponse<null>>("/api/v1/auth/forgot-password/reset", {
    method: "POST",
    authenticated: false,
    retryOnUnauthorized: false,
    credentials: "omit",
    cache: "no-store",
    body: { resetToken, newPassword },
  });
}

export async function getCurrentTeacher() {
  try {
    const response = await apiRequest<ApiResponse<TeacherUserSummary>>("/api/v1/users/me");
    const currentTeacher = response.data;
    if (!currentTeacher) {
      throw new Error("Teacher profile data was not returned by the server.");
    }
    const role =
      typeof currentTeacher.role === "string" ? currentTeacher.role.trim().toUpperCase() : "";
    if (role !== "TEACHER") {
      clearSession();
      throw new Error("This account does not have access to the teacher workspace.");
    }
    return currentTeacher;
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

import { apiRequest, ApiError, restoreStudentSession } from "./client";
import { clearSession, getSession, saveSession } from "../auth/authStorage";
import type {
  ApiResponse,
  AuthSession,
  LoginResponse,
  StudentUserSummary,
} from "../auth/authTypes";

export async function loginStudent(identifier: string, password: string): Promise<AuthSession> {
  const response = await apiRequest<ApiResponse<LoginResponse>>("/api/v1/auth/login", {
    method: "POST",
    authenticated: false,
    body: { identifier, password },
  });
  const data = response.data;
  // The auth service returns the authenticated account as `profile`.
  // Keep `user` as a compatibility fallback for older auth-service builds.
  const rawUser = data?.profile ?? data?.user;
  const role = String(rawUser?.role ?? "").replace(/^ROLE_/, "").toUpperCase();
  if (!data?.accessToken || !rawUser || role !== "STUDENT") {
    throw new Error("This account does not have access to the student workspace.");
  }

  const user: StudentUserSummary = {
    ...rawUser,
    id: rawUser.id ?? rawUser.userId,
    role: "STUDENT",
  };

  const session: AuthSession = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user,
    expiresAt: Date.now() + data.expiresIn * 1000,
  };
  saveSession(session);
  return session;
}

export async function getCurrentStudent(): Promise<StudentUserSummary> {
  try {
    const response = await apiRequest<ApiResponse<StudentUserSummary>>("/api/v1/users/me");
    if (response.data?.role !== "STUDENT") {
      clearSession();
      throw new Error("This account does not have access to the student workspace.");
    }
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) clearSession();
    throw error;
  }
}

export async function restoreStudentAuth() {
  const session = await restoreStudentSession();
  if (!session || session.user.role !== "STUDENT") {
    clearSession();
    return null;
  }
  return session;
}

export async function requestPasswordReset(email: string) {
  return apiRequest<ApiResponse<null>>("/api/v1/auth/forgot-password", {
    method: "POST",
    authenticated: false,
    body: { email },
  });
}

export async function logoutStudent() {
  const refreshToken = getSession()?.refreshToken;
  try {
    if (refreshToken) {
      await apiRequest<ApiResponse<null>>("/api/v1/auth/logout", {
        method: "POST",
        authenticated: false,
        retryOnUnauthorized: false,
        body: { refreshToken },
      });
    }
  } finally {
    clearSession();
  }
}

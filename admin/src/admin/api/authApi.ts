import { apiRequest, refreshStoredSession } from "./client";
import type { ApiResponse, AuthSession, LoginResponse } from "../auth/authTypes";
import { clearSession, getSession, saveSession } from "../auth/authStorage";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export async function loginAdmin(identifier: string, password: string): Promise<AuthSession> {
  const response = await apiRequest<ApiResponse<LoginResponse>>("/api/v1/auth/login", {
    method: "POST",
    authenticated: false,
    body: { identifier, password },
  });

  const user = response.data?.profile ?? response.data?.user;
  if (!user || !ADMIN_ROLES.has(user.role)) {
    throw new Error("This account does not have access to the admin workspace.");
  }

  const session: AuthSession = {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    user,
    expiresAt: Date.now() + response.data.expiresIn * 1000,
    mustChangePassword: Boolean(response.data.mustChangePassword ?? user.mustChangePassword),
  };

  saveSession(session);
  if (!getSession()) {
    clearSession();
    throw new Error("Sign-in returned an incompatible session. Please try signing in again.");
  }
  return session;
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  return apiRequest<ApiResponse<null>>("/api/v1/users/me/password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });
}

export async function requestAdminPasswordReset(email: string) {
  return apiRequest<ApiResponse<null>>("/api/v1/auth/forgot-password", {
    method: "POST",
    authenticated: false,
    retryOnUnauthorized: false,
    credentials: "omit",
    cache: "no-store",
    body: { email },
  });
}

export async function verifyAdminPasswordResetOtp(email: string, otp: string) {
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

export async function resetAdminPassword(resetToken: string, newPassword: string) {
  return apiRequest<ApiResponse<null>>("/api/v1/auth/forgot-password/reset", {
    method: "POST",
    authenticated: false,
    retryOnUnauthorized: false,
    credentials: "omit",
    cache: "no-store",
    body: { resetToken, newPassword },
  });
}

export async function refreshAdminSession() {
  const refreshed = await refreshStoredSession();
  if (!refreshed) {
    throw new Error("Your session has expired. Please sign in again.");
  }
}

export async function logoutAdmin() {
  const session = getSession();

  try {
    if (session?.refreshToken) {
      await apiRequest("/api/v1/auth/logout", {
        method: "POST",
        authenticated: false,
        retryOnUnauthorized: false,
        body: { refreshToken: session.refreshToken },
      });
    }
  } finally {
    clearSession();
  }
}

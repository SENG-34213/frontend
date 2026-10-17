import { apiRequest } from "./client";
import type { ApiResponse, AuthSession, LoginResponse } from "../auth/authTypes";
import { saveSession } from "../auth/authStorage";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export async function loginAdmin(identifier: string, password: string): Promise<AuthSession> {
  const response = await apiRequest<ApiResponse<LoginResponse>>("/api/v1/auth/login", {
    method: "POST",
    authenticated: false,
    body: { identifier, password },
  });

  if (!response.data?.user || !ADMIN_ROLES.has(response.data.user.role)) {
    throw new Error("This account does not have access to the admin workspace.");
  }

  const session: AuthSession = {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    user: response.data.user,
    expiresAt: Date.now() + response.data.expiresIn * 1000,
  };

  saveSession(session);
  return session;
}

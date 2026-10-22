import type { AdminRole } from "../types";

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface AdminUserSummary {
  id: string;
  keycloakUserId?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  accountStatus: string;
  emailVerified: boolean;
  profileComplete: boolean;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  scope?: string;
  issuedAt?: string;
  mustChangePassword?: boolean;
  profile: AdminUserSummary;
  /** Backward-compatible response shape for older auth-service builds. */
  user?: AdminUserSummary;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  scope?: string;
  issuedAt?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AdminUserSummary;
  expiresAt: number;
  mustChangePassword?: boolean;
}

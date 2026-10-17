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
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  scope?: string;
  issuedAt?: string;
  user: AdminUserSummary;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AdminUserSummary;
  expiresAt: number;
}

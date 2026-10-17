export interface ApiResponse<T> {
  statusCode?: number;
  message?: string;
  data?: T;
}

export interface TeacherUserSummary {
  id?: string;
  keycloakUserId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn: number;
  refreshExpiresIn?: number;
  scope?: string;
  issuedAt?: string;
  user?: TeacherUserSummary;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: TeacherUserSummary;
  expiresAt: number;
}

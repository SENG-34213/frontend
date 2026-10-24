export interface ApiResponse<T> {
  statusCode?: number;
  message?: string;
  data?: T;
}

export interface StudentUserSummary {
  id?: string;
  userId?: string;
  keycloakUserId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  accountStatus?: string;
  emailVerified?: boolean;
  profileComplete?: boolean;
  mustChangePassword?: boolean;
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
  mustChangePassword?: boolean;
  rememberMe?: boolean;
  user?: StudentUserSummary;
  profile?: StudentUserSummary;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: StudentUserSummary;
  expiresAt: number;
  mustChangePassword?: boolean;
  rememberMe?: boolean;
}

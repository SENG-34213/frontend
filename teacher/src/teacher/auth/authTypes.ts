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
  phoneNumber?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  dailyDigestEnabled?: boolean;
  dailyDigestTime?: string | null;
  role: string;
  teacherProfile?: {
    id?: string;
    teacherCode?: string;
    dateOfBirth?: string;
    nic?: string;
    specializations?: string[];
    title?: string;
    department?: string;
    officeLocation?: string;
    officeHours?: string;
    bio?: string;
    avatarUrl?: string;
    hireDate?: string;
  } | null;
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

import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";
import type { AccountStatus, UserRole } from "../types";

export interface RegisteredUserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  studentId?: string;
  teacherCode?: string;
}

export interface RegistrationOverview {
  totalUsers: number;
  usersByRole: Partial<Record<UserRole, number>>;
  usersByAccountStatus: Partial<Record<AccountStatus, number>>;
  recentStudents: RegisteredUserSummary[];
  recentTeachers: RegisteredUserSummary[];
}

export async function fetchRegistrationOverview() {
  const response = await apiRequest<ApiResponse<RegistrationOverview>>(
    "/api/internal/users/analytics/registration-overview",
  );
  return response.data;
}

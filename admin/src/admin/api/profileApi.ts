import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";
import type { AdminRole, AccountStatus } from "../types";

export interface CurrentAdminProfile {
  id: string;
  keycloakUserId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: AdminRole;
  accountStatus: AccountStatus | string;
  adminProfile?: {
    adminCode?: string;
    dateOfBirth?: string;
    nic?: string;
  } | null;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    district?: string;
    postalCode?: string;
  } | null;
}

export interface UpdateCurrentAdminProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export async function getCurrentAdminProfile() {
  const response = await apiRequest<ApiResponse<CurrentAdminProfile>>("/api/v1/users/me");
  if (!response.data) throw new Error(response.message || "Profile data was not returned.");
  return response.data;
}

export async function updateCurrentAdminProfile(payload: UpdateCurrentAdminProfileRequest) {
  const response = await apiRequest<ApiResponse<CurrentAdminProfile>>("/api/v1/users/me", {
    method: "PATCH",
    body: payload,
  });
  if (!response.data) throw new Error(response.message || "Updated profile was not returned.");
  return response.data;
}

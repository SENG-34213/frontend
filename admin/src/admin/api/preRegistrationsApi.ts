import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type PreRegistrationStatus = "NEW" | "IN_REVIEW" | "COMPLETED";
export type PreRegistrationSeenFilter = "ALL" | "SEEN" | "UNSEEN";

export interface PreRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "parent";
  district: string;
  city: string;
  classFormat: "online" | "onsite" | "either";
  grade: string;
  subjects: string[];
  contactMethod: "whatsapp" | "phone" | "email";
  consent: boolean;
  status: PreRegistrationStatus;
  seen: boolean;
  adminRemark?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PreRegistrationPage {
  content: PreRegistration[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function fetchPreRegistrations(options: {
  status?: PreRegistrationStatus | "ALL";
  seen?: PreRegistrationSeenFilter;
  page?: number;
  size?: number;
}): Promise<PreRegistrationPage> {
  const params = new URLSearchParams({
    page: String(options.page ?? 0),
    size: String(options.size ?? 20),
  });
  if (options.status && options.status !== "ALL") params.set("status", options.status);
  if (options.seen && options.seen !== "ALL") {
    params.set("seen", String(options.seen === "SEEN"));
  }

  const response = await apiRequest<ApiResponse<PreRegistrationPage>>(
    `/api/v1/admin/pre-registrations?${params.toString()}`,
  );
  if (!response.data || !Array.isArray(response.data.content)) {
    throw new Error(response.message || "The pre-registration service returned invalid data.");
  }
  return response.data;
}

export async function updatePreRegistration(
  id: string,
  update: Partial<Pick<PreRegistration, "status" | "seen" | "adminRemark">>,
) {
  const response = await apiRequest<ApiResponse<PreRegistration>>(
    `/api/v1/admin/pre-registrations/${encodeURIComponent(id)}`,
    { method: "PATCH", body: update },
  );
  if (!response.data) {
    throw new Error(response.message || "The pre-registration could not be updated.");
  }
  return response.data;
}
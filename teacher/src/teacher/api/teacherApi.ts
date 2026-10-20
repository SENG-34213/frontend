import { apiRequest } from "./client";
import { getCurrentTeacher } from "./auth";
import type { ApiResponse, TeacherUserSummary } from "../auth/authTypes";

export type TeacherShellData = {
  user: TeacherUserSummary;
  unreadNotificationsCount: number;
  notificationsError?: Error;
};

export type UpdateCurrentTeacherPayload = {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  dailyDigestEnabled?: boolean;
  dailyDigestTime?: string;
};

export type UpdateTeacherProfilePayload = {
  specializations?: string[];
  phoneNumber?: string;
  title?: string;
  department?: string;
  officeLocation?: string;
  officeHours?: string;
  bio?: string;
  avatarUrl?: string;
};

async function updateTeacher<T>(path: string, payload: T): Promise<TeacherUserSummary> {
  const response = await apiRequest<ApiResponse<TeacherUserSummary>>(path, {
    method: "PATCH",
    body: payload,
  });

  if (!response.data) throw new Error("The server returned no updated teacher profile.");
  return response.data;
}

export function updateCurrentTeacher(payload: UpdateCurrentTeacherPayload) {
  return updateTeacher("/api/v1/users/me", payload);
}

export function updateTeacherProfile(payload: UpdateTeacherProfilePayload) {
  return updateTeacher("/api/v1/users/teachers/me", payload);
}

export async function getTeacherShellData(signal?: AbortSignal): Promise<TeacherShellData> {
  const [userResult, notificationsResult] = await Promise.allSettled([
    getCurrentTeacher(),
    apiRequest<ApiResponse<number>>("/api/v1/notifications/unread-count", { signal }),
  ]);

  if (userResult.status === "rejected") throw userResult.reason;
  const notificationsError =
    notificationsResult.status === "rejected"
      ? notificationsResult.reason instanceof Error
        ? notificationsResult.reason
        : new Error("Unread notifications could not be loaded.")
      : undefined;

  return {
    user: userResult.value,
    unreadNotificationsCount:
      notificationsResult.status === "fulfilled" ? Number(notificationsResult.value.data ?? 0) : 0,
    notificationsError,
  };
}

import { apiRequest } from "./client";
import type { ApiResponse, TeacherUserSummary } from "../auth/authTypes";

export type TeacherShellData = {
  user: TeacherUserSummary;
  unreadNotificationsCount: number;
  notificationsError?: Error;
};

export async function getTeacherShellData(signal?: AbortSignal): Promise<TeacherShellData> {
  const [userResult, notificationsResult] = await Promise.allSettled([
    apiRequest<ApiResponse<TeacherUserSummary>>("/api/v1/users/me", { signal }),
    apiRequest<ApiResponse<number>>("/api/v1/notifications/unread-count", { signal }),
  ]);

  if (userResult.status === "rejected") throw userResult.reason;
  const notificationsError =
    notificationsResult.status === "rejected"
      ? notificationsResult.reason instanceof Error
        ? notificationsResult.reason
        : new Error("Unread notifications could not be loaded.")
      : undefined;

  if (!userResult.value.data) throw new Error("The current teacher profile was empty.");

  return {
    user: userResult.value.data,
    unreadNotificationsCount:
      notificationsResult.status === "fulfilled" ? Number(notificationsResult.value.data ?? 0) : 0,
    notificationsError,
  };
}

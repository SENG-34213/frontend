import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type BackendNotification = {
  id: string;
  type?: string;
  title: string;
  message: string;
  occurredAt?: string;
  createdAt?: string;
  readAt?: string | null;
};

type NotificationPage = {
  notifications: BackendNotification[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  unreadCount?: number;
};

export async function getAdminNotifications() {
  const response = await apiRequest<ApiResponse<NotificationPage>>(
    "/api/v1/notifications?size=100",
  );
  if (!response.data || !Array.isArray(response.data.notifications)) {
    throw new Error(response.message || "The notification service returned an invalid response.");
  }
  return response.data.notifications;
}

export async function markAdminNotificationRead(notificationId: string) {
  const response = await apiRequest<ApiResponse<BackendNotification>>(
    `/api/v1/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "PATCH" },
  );
  return response.data;
}

export async function markAllAdminNotificationsRead() {
  await apiRequest<ApiResponse<number>>("/api/v1/notifications/read-all", { method: "PATCH" });
}

export async function deleteAdminNotification(notificationId: string) {
  await apiRequest<ApiResponse<null>>(
    `/api/v1/notifications/${encodeURIComponent(notificationId)}`,
    { method: "DELETE" },
  );
}

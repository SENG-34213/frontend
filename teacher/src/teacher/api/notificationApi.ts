import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type BackendNotification = {
  id: string;
  type?: string;
  title: string;
  message: string;
  sourceService?: string;
  occurredAt?: string;
  createdAt?: string;
  readAt?: string | null;
  emailStatus?: string;
};

export type NotificationPage = {
  notifications: BackendNotification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  unreadCount: number;
};

export async function getNotifications(
  page = 0,
  size = 20,
  unreadOnly = false,
  signal?: AbortSignal,
): Promise<NotificationPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    unreadOnly: String(unreadOnly),
  });
  const response = await apiRequest<ApiResponse<NotificationPage>>(
    `/api/v1/notifications?${params.toString()}`,
    { signal },
  );

  if (!response.data || !Array.isArray(response.data.notifications)) {
    throw new Error(response.message || "The notification service returned an invalid response.");
  }

  return response.data;
}

export async function markNotificationRead(notificationId: string) {
  const response = await apiRequest<ApiResponse<BackendNotification>>(
    `/api/v1/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "PATCH" },
  );
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await apiRequest<ApiResponse<number>>("/api/v1/notifications/read-all", {
    method: "PATCH",
  });
  return response.data ?? 0;
}

export async function deleteNotification(notificationId: string) {
  await apiRequest<ApiResponse<null>>(
    `/api/v1/notifications/${encodeURIComponent(notificationId)}`,
    {
      method: "DELETE",
    },
  );
}

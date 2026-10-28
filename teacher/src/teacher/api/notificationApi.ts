import { apiRequest } from "./client";
import type { ApiResponse } from "../auth/authTypes";

export type BackendNotification = {
  id: string;
  sourceService?: string;
  type?: string;
  title: string;
  message: string;
  occurredAt?: string;
  createdAt?: string;
  readAt?: string | null;
  emailStatus?: string;
};

export type BackendAnnouncement = {
  id: string;
  title: string;
  content: string;
  audience?: "ALL" | "STUDENT" | "TEACHER" | "ADMIN";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishAt?: string | null;
  expiresAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  read?: boolean;
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

export async function getAnnouncements(page = 0, size = 100, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const response = await apiRequest<ApiResponse<{ content: BackendAnnouncement[] }>>(
    `/api/v1/notifications/announcements?${params.toString()}`,
    { signal },
  );
  if (!response.data || !Array.isArray(response.data.content)) {
    throw new Error(response.message || "The announcement service returned an invalid response.");
  }
  return response.data.content;
}

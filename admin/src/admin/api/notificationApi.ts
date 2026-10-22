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

export type NotificationPage = {
  notifications: BackendNotification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  unreadCount: number;
};

export async function getAdminNotifications(page = 0, size = 100) {
  const response = await apiRequest<ApiResponse<NotificationPage>>(
    `/api/v1/notifications?page=${page}&size=${size}`,
  );
  if (!response.data || !Array.isArray(response.data.notifications)) {
    throw new Error(response.message || "The notification service returned an invalid response.");
  }
  return response.data;
}

export async function markAdminNotificationRead(id: string) {
  return apiRequest<ApiResponse<BackendNotification>>(
    `/api/v1/notifications/${encodeURIComponent(id)}/read`,
    { method: "PATCH" },
  );
}

export async function markAllAdminNotificationsRead() {
  return apiRequest<ApiResponse<number>>("/api/v1/notifications/read-all", { method: "PATCH" });
}

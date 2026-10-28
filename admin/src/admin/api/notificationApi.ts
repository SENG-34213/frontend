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

export type AnnouncementAudience = "ALL" | "STUDENT" | "TEACHER" | "ADMIN";
export type AnnouncementPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type BackendAnnouncement = {
  id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  publishAt?: string | null;
  expiresAt?: string | null;
  publishedAt?: string | null;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  read?: boolean;
};

type AnnouncementPage = {
  content: BackendAnnouncement[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CreateAnnouncementPayload = {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  priority: AnnouncementPriority;
  publishAt?: string | null;
  expiresAt?: string | null;
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

export async function getAdminAnnouncements(page = 0, size = 100) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const response = await apiRequest<ApiResponse<AnnouncementPage>>(
    `/api/v1/notifications/admin/announcements?${params.toString()}`,
  );
  if (!response.data || !Array.isArray(response.data.content)) {
    throw new Error(response.message || "The announcement service returned an invalid response.");
  }
  return response.data;
}

export async function createAdminAnnouncement(payload: CreateAnnouncementPayload) {
  const response = await apiRequest<ApiResponse<BackendAnnouncement>>(
    "/api/v1/notifications/admin/announcements",
    { method: "POST", body: payload },
  );
  return response.data;
}

export async function publishAdminAnnouncement(announcementId: string) {
  const response = await apiRequest<ApiResponse<BackendAnnouncement>>(
    `/api/v1/notifications/admin/announcements/${encodeURIComponent(announcementId)}/publish`,
    { method: "POST" },
  );
  return response.data;
}

export async function updateAdminAnnouncement(
  announcementId: string,
  payload: CreateAnnouncementPayload,
) {
  const response = await apiRequest<ApiResponse<BackendAnnouncement>>(
    `/api/v1/notifications/admin/announcements/${encodeURIComponent(announcementId)}`,
    { method: "PUT", body: payload },
  );
  return response.data;
}

export async function deleteAdminAnnouncement(announcementId: string) {
  await apiRequest<ApiResponse<null>>(
    `/api/v1/notifications/admin/announcements/${encodeURIComponent(announcementId)}`,
    { method: "DELETE" },
  );
}
